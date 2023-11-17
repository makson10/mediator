const {
    getVars,
    updateLinkMessageId,
    updateLessonScheduleMessageId
} = require('./functions/varsFunctions');
const {
    getLessons,
    insertLessonsToDB,
    addLessonToSchedule,
    removeLessonFromSchedule,
    insertLinksToLessons,
    unpinLessonsScheduleMessage
} = require('./functions/lessonsFunctions');
const {
    getHWs,
    insertHwToDB,
    deleteHW,
    deleteAllHw,
    returnLastDeletedLink,
    removeOldHwLinks
} = require('./functions/homeworkFunctions');
const { sortingHw } = require('./functions/hwSortingFunctions');
const { getAccounts, loginUser, getUserChatId, getUserSettings, setNewSettings } = require('./functions/accountsFunction');

module.exports = {
    getVars,
    updateLinkMessageId,
    updateLessonScheduleMessageId,
    addLessonToSchedule,
    removeLessonFromSchedule,
    insertLinksToLessons,
    getHWs,
    insertHwToDB,
    deleteHW,
    getLessons,
    insertLessonsToDB,
    deleteAllHw,
    returnLastDeletedLink,
    unpinLessonsScheduleMessage,
    sortingHw,
    getAccounts,
    loginUser,
    getUserChatId,
    getUserSettings,
    setNewSettings,
    removeOldHwLinks,
};