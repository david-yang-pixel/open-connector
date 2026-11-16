import type { JsonSchema } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";

const songFields = {
  songMid: s.string("Song MID."),
  songName: s.string("Song name."),
  singerMid: s.string("Singer MID."),
  singerName: s.string("Singer name."),
};
const songCounts = s.looseObject("A song listening count.", {
  ...songFields,
  sum: s.integer("Number of plays."),
});
const singerTimes = s.looseObject("A singer listening duration.", {
  ...songFields,
  sum: s.integer("Listening time in seconds."),
});
const indexedDuration = s.looseObject("An indexed time-slot value; identify the slot by its array index.", {
  sum: s.integer("Listening duration in seconds."),
});
const averageTimes = s.array(
  "Average listening time by time slot; slots are identified by array index.",
  s.looseObject("Current and recent average listening time for a slot.", {
    currentAverage: indexedDuration,
    nearAverage: indexedDuration,
  }),
);
const songMetric = s.looseObject("A monthly song metric.", {
  ...songFields,
  sum: s.integer("Provider-defined song metric; units depend on the containing section."),
});
const dailyActivity = s.looseObject("A representative song for one day.", {
  ...songFields,
  sum: s.integer("Activity flag: 1 means listened on this day, 0 means no listening."),
});
const singerStreak = s.looseObject("Singer with the longest listening streak.", {
  ...songFields,
  sum: s.integer("Consecutive days listening to this singer."),
});
export const dayReport: JsonSchema = s.nullable(
  s.looseObject("Daily listening report.", {
    listenTime: s.integer("Total listening time for this day in seconds."),
    activeHour: s.integer("Active hour of the day, 0 through 23."),
    averageTime: averageTimes,
    singerListen: s.array("Top singers; sum is listening time in seconds.", singerTimes),
    songListen: s.array("Top songs; sum is the play count.", songCounts),
  }),
);
export const weekReport: JsonSchema = s.nullable(
  s.looseObject("Weekly listening report.", {
    listenTime: s.integer("Daily average listening time for this week in seconds."),
    floatNumber: s.number("Change ratio compared with last week; positive means an increase."),
    averageTime: averageTimes,
    singerListen: s.array("Top singers; sum is listening time in seconds.", singerTimes),
    songListen: s.array("Top songs; sum is the play count.", songCounts),
  }),
);
export const monthReport: JsonSchema = s.nullable(
  s.looseObject("Monthly listening statistics and preferences.", {
    monthDetailList: s.array(
      "Monthly listening details.",
      s.looseObject("Details for one month.", {
        listenCount: s.integer("Total plays in the month."),
        dataTime: s.string("Month of the data."),
        exportTime: s.string("Data export time."),
        songs: s.array("Songs in the monthly details.", songMetric),
      }),
    ),
    topDataList: s.array(
      "Top statistics, one entry per month.",
      s.looseObject("Top statistics for one month.", {
        selectType: s.integer("Provider data dimension type."),
        month: s.string("Month represented by these statistics."),
        topSinger: s.array("Top singers; sum is listening time in seconds.", singerTimes),
        topSong: s.array("Top songs; sum is the play count.", songCounts),
        favSongMid: s.string("Favorite song MID."),
        favSongName: s.string("Favorite song name."),
        favSingerMid: s.string("Singer MID of the favorite song."),
        favSingerName: s.string("Singer name of the favorite song."),
        repeatSong: s.looseObject("Most repeated song.", {
          ...songFields,
          listenDate: s.string("Date of repeated listening."),
          count: s.integer("Repeat count."),
        }),
        midnightSong: s.looseObject("Late-night song.", {
          ...songFields,
          month: s.integer("Month number."),
          hour: s.integer("Listening hour, 0 through 23."),
        }),
      }),
    ),
    topSinger: s.array("Top singers; sum is listening time in seconds.", singerTimes),
    topSong: s.array("Top songs; sum is the play count.", songCounts),
    preferHour: s.looseObject("Preferred listening hour.", {
      preferHour: s.integer("Preferred hour, 0 through 23."),
      preferInfo: s.array("Listening details indexed by time slot; only sum is populated.", indexedDuration),
      songListen: s.array("Favorite songs in this time slot.", songMetric),
    }),
    consDays: s.looseObject("Consecutive listening statistics.", {
      conDays: s.integer("Consecutive listening days."),
      conInfoList: s.array("Daily listening activity and representative songs.", dailyActivity),
      topListen: s.integer("Maximum song count in one day."),
      singerDay: singerStreak,
      songListen: s.array("Songs during the listening streak.", songMetric),
    }),
    topGenre: s.looseObject("Preferred genres.", {
      genreId: s.integer("Preferred genre ID."),
      genre2Count: s.array(
        "Genre metrics over the past six months.",
        s.looseObject("A named genre metric.", {
          name: s.string("Genre name."),
          sum: s.integer("Genre occurrence count over the past six months."),
        }),
      ),
      genreSong: s.array("Representative songs for the genre.", songMetric),
    }),
    nicheSongs: s.looseObject("Niche and popular music preferences.", {
      nichePercent: s.integer("Niche song percentage, 0 through 100."),
      list: s.array("Representative niche songs.", songMetric),
      hotPercent: s.integer("Popular song percentage, 0 through 100."),
    }),
    newSongs: s.looseObject("New music exploration.", {
      newSongCount: s.integer("New songs explored this month."),
      floatNumber: s.number("Change ratio compared with last month."),
      lastNewSongCount: s.integer("New songs explored last month."),
      list: s.array("Representative newly explored songs.", songMetric),
    }),
    listenCityInfo: s.array(
      "Listening cities ordered by unlock time.",
      s.looseObject("A listening city.", {
        cityId: s.integer("City ID."),
        cityName: s.string("City name."),
        provinceId: s.integer("Province ID."),
        provinceName: s.string("Province name."),
        countryId: s.integer("Country ID."),
        countryName: s.string("Country name."),
        unlockTime: s.integer("City unlock Unix timestamp in seconds."),
        cityRank: s.integer("City rank."),
      }),
    ),
  }),
);
