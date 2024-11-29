"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixDate = exports.formatDatePdf = exports.formatDate = exports.parseDate = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
const localizedFormat_1 = __importDefault(require("dayjs/plugin/localizedFormat"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(customParseFormat_1.default);
dayjs_1.default.extend(localizedFormat_1.default);
const bratislavaTimezone = 'Europe/Bratislava';
function parseDate(date, format) {
    if (typeof date !== 'string') {
        return;
    }
    // When using dayjs.tz, if the date is not in the correct format, it throws an error:
    // RangeError: Invalid time value
    // This behavior is unexpected because when no timezone is used, dayjs returns a date object
    // with the isValid() method returning `false` instead of throwing an error.
    try {
        const parsedDate = dayjs_1.default.tz(date, format, bratislavaTimezone);
        // tz doesn't support `strict` parsing as last parameter
        const isStrictlyParsed = parsedDate.format(format) === date;
        if (parsedDate.isValid() && isStrictlyParsed) {
            return parsedDate.toDate();
        }
    }
    catch (error) { }
}
exports.parseDate = parseDate;
function formatDate(date, format) {
    if (!date) {
        return;
    }
    return (0, dayjs_1.default)(date).tz(bratislavaTimezone).format(format);
}
exports.formatDate = formatDate;
function formatDatePdf(date) {
    if (!date) {
        return;
    }
    return (0, dayjs_1.default)(date).tz(bratislavaTimezone).format('DD.MM.YYYY');
}
exports.formatDatePdf = formatDatePdf;
// TODO comment
function fixDate(date) {
    return (0, dayjs_1.default)(date).tz(bratislavaTimezone).toDate();
}
exports.fixDate = fixDate;
