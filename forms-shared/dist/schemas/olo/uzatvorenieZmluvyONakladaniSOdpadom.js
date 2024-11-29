"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const zevoShared_1 = require("./shared/zevoShared");
exports.default = (0, functions_1.schema)({ title: 'Uzatvorenie zmluvy o nakladaní s odpadom' }, {}, (0, zevoShared_1.getZevoSchema)(zevoShared_1.ZevoType.UzatvorenieZmluvyONakladaniSOdpadom));
