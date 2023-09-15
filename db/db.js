const { getVars, updateLinkMessageId, updateLessonScheduleMessageId } = require('./functions/varsFunctions');
const { getLessons, insertLessonsToDB, insertLinksToLessons, unpinLessonsScheduleMessage } = require('./functions/lessonsFunctions');
const { getHWs, insertHWToDB, deleteHW, deleteAllHw, returnLastDeletedLink } = require('./functions/homeworkFunctions');
const { sortingHw } = require('./functions/hwSortingFunctions');
const { loginUser, getUserChatId, getUserSettings, setNewSettings } = require('./functions/accountsFunction');

module.exports = {
    getVars,
    updateLinkMessageId,
    updateLessonScheduleMessageId,
    insertLinksToLessons,
    getHWs,
    insertHWToDB,
    deleteHW,
    getLessons,
    insertLessonsToDB,
    deleteAllHw,
    returnLastDeletedLink,
    unpinLessonsScheduleMessage,
    sortingHw,
    loginUser,
    getUserChatId,
    getUserSettings,
    setNewSettings,
};