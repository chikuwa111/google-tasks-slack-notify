const main = () => {
  const ScriptProperties = PropertiesService.getScriptProperties();
  const TOKEN = ScriptProperties.getProperty('TOKEN');
  const CHANNEL_ID = ScriptProperties.getProperty('CHANNEL_ID');

  if (TOKEN == null || CHANNEL_ID == null) {
    throw new Error('Failed to get properties.');
  }

  const text = "Today's Tasklist";
  const tasks = getTasks();
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Today's Tasklist*",
      },
    },
    { type: 'divider' },
    ...tasks.map(makeBlock),
  ];
  const isSuccess = postSlackMessage(TOKEN, CHANNEL_ID, text, blocks);
  if (!isSuccess) {
    throw new Error('Failed to post message.');
  }
};

const getTasks = () => {
  const dueMax = getDueMax();
  const items = Tasks.Tasks?.list('@default', { dueMax }).items;
  return items ?? [];
};

/**
 * 翌日の世界標準時で0時を回ったdateのRFC 3339 timestampを返す
 */
const getDueMax = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setUTCHours(0);
  return date.toISOString();
};

const makeBlock = ({ title, notes }: GoogleAppsScript.Tasks.Schema.Task) => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `- *${title}*\n${notes ?? ''}`,
  },
});

const postSlackMessage = (
  token: string,
  channelId: string,
  text: string,
  blocks: Array<{ type: string }>
) => {
  const url = 'https://slack.com/api/chat.postMessage';
  const formData = {
    icon_emoji: ':white_check_mark:',
    username: 'TaskBot',
    token,
    channel: channelId,
    text,
    blocks: JSON.stringify(blocks),
  };
  const options = {
    method: 'post' as const,
    payload: formData,
  };
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  if (!json.ok) {
    Logger.log(`Failed to post message: ${json.error}`);
    return false;
  }
  return true;
};
