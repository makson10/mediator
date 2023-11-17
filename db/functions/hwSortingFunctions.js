const dateRegex = /[0-3][0-9].[0-1][0-9]/gm;

const getHomeworksToToday = async (homeworks) => {
    const date = new Date();
    const todayDay = date.getDate();
    let todayMonth = date.getMonth() + 1;
    if (todayMonth.toString().length === 1) todayMonth = '0' + todayMonth;

    const todayRegex = new RegExp(todayDay + '.' + todayMonth, 'gm');

    const homeworksWithTodayWord = homeworks.filter((homework) => /сегодня/gmi.test(homework.lessonTitle));
    const homeworksToTodayByDate = homeworks.filter((homework) => todayRegex.test(homework.lessonTitle));
    const homeworksWithYesterdayWord = homeworks.filter((homework) => /завтра/gmi.test(homework.lessonTitle));

    const homeworksToToday = [
        ...homeworksWithTodayWord,
        ...homeworksToTodayByDate,
        ...homeworksWithYesterdayWord
    ];

    return homeworksToToday;
}

const getHomeworksWithDate = async (homeworks) => {
    const homeworksWithDate = homeworks.filter(
        (homework) => homework.lessonTitle.match(dateRegex)
    );

    return homeworksWithDate;
}

const extractHomeworkDayAndMonth = (homework) => {
    const homeworkDate = homework.lessonTitle.match(dateRegex);
    let [homeworkDay, homeworkMonth] = homeworkDate[0].split('.');
    homeworkDay = +homeworkDay;
    homeworkMonth = +homeworkMonth;

    return [homeworkDay, homeworkMonth];
}

const makeBubbleSorting = async (homeworks) => {
    const hwAmount = homeworks.length;

    for (let i = 0; i < hwAmount - 1; i++) {
        let swaped = false;

        for (let j = 0; j < hwAmount - i - 1; j++) {
            const homework = homeworks[j];
            const [homeworkDay, homeworkMonth] = extractHomeworkDayAndMonth(homework);

            const nextHomework = homeworks[j + 1];
            const [nextHomeworkDay, nextHomeworkMonth] = extractHomeworkDayAndMonth(nextHomework);

            if (homeworkMonth > nextHomeworkMonth) {
                const temp = homeworks[j];
                homeworks[j] = homeworks[j + 1];
                homeworks[j + 1] = temp;

                swaped = true;
            }
        }

        for (let j = 0; j < hwAmount - i - 1; j++) {
            const homework = homeworks[j];
            const [homeworkDay, homeworkMonth] = extractHomeworkDayAndMonth(homework);

            const nextHomework = homeworks[j + 1];
            const [nextHomeworkDay, nextHomeworkMonth] = extractHomeworkDayAndMonth(nextHomework);

            if (homeworkMonth === nextHomeworkMonth && homeworkDay > nextHomeworkDay) {
                const temp = homeworks[j];
                homeworks[j] = homeworks[j + 1];
                homeworks[j + 1] = temp;

                swaped = true;
            }
        }

        if (!swaped) return;
    }
};

const sortingHw = async (homeworks) => {
    const homeworksToToday = await getHomeworksToToday(homeworks);
    homeworks = homeworks.filter((hw) => !homeworksToToday.some(
        (hwToToday) => hw.lessonTitle === hwToToday.lessonTitle)
    );

    const homeworksWithDate = await getHomeworksWithDate(homeworks);
    homeworks = homeworks.filter((hw) => !homeworksWithDate.some(
        (hwWithDate) => hw.lessonTitle === hwWithDate.lessonTitle)
    );

    const otherHomework = homeworks;


    await makeBubbleSorting(homeworksWithDate);

    const sortedHomeworks = [
        ...homeworksToToday,
        ...homeworksWithDate,
        ...otherHomework,
    ];

    return sortedHomeworks;
}

module.exports = { sortingHw }