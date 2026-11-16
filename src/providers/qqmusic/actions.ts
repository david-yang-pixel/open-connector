import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { dayReport, weekReport, monthReport } from "./report-schema.ts";
const page = s.integer("Zero-based page number; defaults to 0.", { minimum: 0, default: 0 });
const traceId = s.string("Request trace ID.");
const responseTimestamp = s.integer("Response timestamp in milliseconds.");
const gatewayCode = s.integer("Gateway result code; nonzero indicates failure.");
const businessCode = s.integer("Business result code; nonzero indicates failure.");
const providerMessage = s.string("Provider message.");
const songMid = s.string("Song MID.");
const songName = s.string("Song name.");
const singerName = s.string("Singer name.");
const songUrl = s.string("Song listening page URL.");
const song = s.looseObject("A song with its listening page.", { songMid, songName, singerName, songH5Url: songUrl });
const albumMid = s.string("Album or radio MID.");
const albumName = s.string("Album or radio name.");
const publicationDate = s.string("Publication date.");
const listenCount = s.integer("Listen count.");
const albumCategory = s.string("Album category.");
const albumDescription = s.string("Album or radio description.");
const album = s.looseObject("Album or radio metadata.", {
  albumMid,
  albumName,
  singerName,
  publicTime: publicationDate,
  listenNum: listenCount,
  category: albumCategory,
  albumDesc: albumDescription,
});
const playlistId = s.integer("Playlist ID.");
const playlistName = s.string("Playlist name.");
const playlistDescription = s.string("Playlist description.");
const creatorName = s.string("Creator name; may be empty for AI playlists.");
const playlist = s.looseObject("Playlist metadata.", {
  dissId: playlistId,
  dissName: playlistName,
  dissDesc: playlistDescription,
  creatorName,
});
const hasMore = s.boolean("Whether another page exists.");
const emptyInput = s.object("No input parameters.", {}, { required: [] });
const recommendedSongs = s.array("Recommended songs.", song);
const recommendationOutput = s.looseObject("QQ Music response with upstream fields preserved.", {
  traceId,
  ts: responseTimestamp,
  ret: gatewayCode,
  sub_ret: businessCode,
  msg: providerMessage,
  songlist: recommendedSongs,
});
const chartId = s.integer("Chart ID returned by list_charts.");
const chartName = s.string("Chart name.");
const listenerCount = s.integer("Listener count.");
const totalSongs = s.integer("Total song count.");
const tracks = s.array("Songs on this page.", song);
export const qqmusicActions: ActionDefinition[] = [
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "search",
    description:
      "Search songs, albums, playlists, music videos, radios, or singers. Increment page while hasMore is true.",
    inputSchema: s.object(
      "Search parameters.",
      {
        keyword: s.string("Search keywords.", { minLength: 1 }),
        type: {
          ...s.string(
            "Search type: 0 songs, 1 albums, 2 playlists, 3 music videos, 4 radios, 5 singers. Defaults to 0.",
            { default: "0" },
          ),
          enum: ["0", "1", "2", "3", "4", "5"],
        },
        page,
      },
      { required: ["keyword"] },
    ),
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      songs: s.nullable(s.array("Matching songs; other result types may be null.", song)),
      albums: s.nullable(s.array("Matching albums.", album)),
      playlists: s.nullable(s.array("Matching playlists.", playlist)),
      mvs: s.nullable(
        s.array(
          "Matching music videos.",
          s.looseObject("Music video metadata.", {
            mvVid: s.string("Music video ID."),
            mvName: s.string("Music video name."),
            singerName,
            playCount: s.integer("Play count."),
            publicTime: publicationDate,
            mvUrl: s.string("Music video page URL."),
          }),
        ),
      ),
      radios: s.nullable(s.array("Matching radios.", album)),
      singers: s.nullable(
        s.array(
          "Matching singers.",
          s.looseObject("Singer metadata.", {
            singerMid: s.string("Singer MID."),
            singerName,
            songNum: s.integer("Song count."),
            albumNum: s.integer("Album count."),
          }),
        ),
      ),
      hasMore,
    }),
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "get_daily_mix",
    description: "Get the daily personalized song recommendations.",
    inputSchema: emptyInput,
    outputSchema: recommendationOutput,
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "get_radio",
    description: "Get songs from the personalized radio.",
    inputSchema: emptyInput,
    outputSchema: recommendationOutput,
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "list_ai_playlists",
    description: "List AI-recommended playlists. This endpoint does not accept a prompt or create a playlist.",
    inputSchema: emptyInput,
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      playlists: s.array("AI-recommended playlists.", playlist),
    }),
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "list_charts",
    description: "List chart groups and chart previews. Use topId to retrieve a chart.",
    inputSchema: emptyInput,
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      groupList: s.array(
        "Chart groups.",
        s.looseObject("A chart group.", {
          groupName: s.string("Group name."),
          groupTopList: s.array(
            "Charts in this group.",
            s.looseObject("Chart summary.", {
              topId: chartId,
              topName: chartName,
              listenNum: listenerCount,
              totalNum: totalSongs,
              songList: s.array(
                "Preview of ranked songs.",
                s.looseObject("A ranked song.", {
                  songMid,
                  songName,
                  singerName,
                  songH5Url: songUrl,
                  rank: s.integer("Song rank."),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "get_chart",
    description: "Get one page of a chart. Increment page while hasMore is true.",
    inputSchema: s.object("Chart query parameters.", { topId: chartId, page: page }, { required: ["topId"] }),
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      topId: chartId,
      topName: chartName,
      listenNum: listenerCount,
      totalNum: totalSongs,
      topType: s.integer("Chart type."),
      topDesc: s.string("Chart description."),
      topHeaderPic: s.string("Chart header image URL."),
      topBannerPic: s.string("Chart banner image URL."),
      updateTime: s.string("Chart update time."),
      hasMore,
      trackList: tracks,
    }),
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "get_playlist",
    description: "Get one page of a playlist. Increment page while hasMore is true.",
    inputSchema: s.object("Playlist query parameters.", { dissId: playlistId, page: page }, { required: ["dissId"] }),
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      dissId: playlistId,
      dissName: playlistName,
      desc: playlistDescription,
      picUrl: s.string("Playlist cover image URL."),
      totalNum: totalSongs,
      hasMore,
      trackList: tracks,
    }),
  }),
  defineProviderAction("qqmusic", {
    operationType: "read",
    requiredScopes: [],
    name: "get_listening_report",
    description:
      "Get personal daily, weekly, or monthly listening statistics. Only the selected time dimension is populated.",
    inputSchema: s.object(
      "Listening report parameters.",
      {
        timeKey: {
          ...s.string("Report period: d daily, w weekly, m or empty monthly; defaults to m.", {
            default: "m",
          }),
          enum: ["d", "w", "m", ""],
        },
        startTime: s.integer(
          "Unix seconds at the target day midnight or target week Monday midnight. Omit for today or this week; ignored for monthly reports.",
        ),
      },
      { required: [] },
    ),
    outputSchema: s.looseObject("QQ Music response with upstream fields preserved.", {
      traceId,
      ts: responseTimestamp,
      ret: gatewayCode,
      sub_ret: businessCode,
      msg: providerMessage,
      dayData: dayReport,
      weekData: weekReport,
      monthData: monthReport,
    }),
  }),
];
