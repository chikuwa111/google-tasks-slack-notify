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
