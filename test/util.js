const addMonths = require('date-fns/add_months');
const endOfMonth = require('date-fns/end_of_month');
const startOfMonth = require('date-fns/start_of_month');
const format = require('date-fns/format');

/**
 * Return the start date of the next month ('YYYY-MM-DD')
 */
const startNextMonthDate = () => {
    const nextMonthDate = addMonths(new Date(), 1);

    return format(startOfMonth(nextMonthDate), 'YYYY-MM-DD');
};

/**
 * Return the end date of the next month ('YYYY-MM-DD')
 */
const endNextMonthDate = () => {
    const nextMonthDate = addMonths(new Date(), 1);

    return format(endOfMonth(nextMonthDate), 'YYYY-MM-DD');
};

module.exports = {
    startNextMonthDate,
    endNextMonthDate
};
