import type { ActionDefinition } from "../../core/types.ts";

import { accountActions } from "./actions-account.ts";
import { autohomeActions } from "./actions-autohome.ts";
import { baijiahaoActions } from "./actions-baijiahao.ts";
import { bilibiliActions } from "./actions-bilibili.ts";
import { dongchediActions } from "./actions-dongchedi.ts";
import { douyinActions } from "./actions-douyin.ts";
import { generationActions } from "./actions-generation.ts";
import { instagramActions } from "./actions-instagram.ts";
import { kuaishouActions } from "./actions-kuaishou.ts";
import { searchActions } from "./actions-search.ts";
import { tiktokActions } from "./actions-tiktok.ts";
import { toolsActions } from "./actions-tools.ts";
import { toutiaoActions } from "./actions-toutiao.ts";
import { transcriptionActions } from "./actions-transcription.ts";
import { wechatChannelActions } from "./actions-wechat-channel.ts";
import { wechatActions } from "./actions-wechat.ts";
import { weiboActions } from "./actions-weibo.ts";
import { xActions } from "./actions-x.ts";
import { xiaohongshuActions } from "./actions-xiaohongshu.ts";
import { yicheActions } from "./actions-yiche.ts";
import { youtubeActions } from "./actions-youtube.ts";
import { zhihuActions } from "./actions-zhihu.ts";

const synchronousActions: ActionDefinition[] = [
  ...douyinActions,
  ...xiaohongshuActions,
  ...wechatActions,
  ...wechatChannelActions,
  ...kuaishouActions,
  ...bilibiliActions,
  ...toutiaoActions,
  ...tiktokActions,
  ...xActions,
  ...youtubeActions,
  ...instagramActions,
  ...autohomeActions,
  ...dongchediActions,
  ...yicheActions,
  ...weiboActions,
  ...baijiahaoActions,
  ...zhihuActions,
  ...toolsActions,
];

export const redfoxActions: ActionDefinition[] = [
  ...synchronousActions,
  ...transcriptionActions,
  ...generationActions,
  ...searchActions,
  ...accountActions,
];
