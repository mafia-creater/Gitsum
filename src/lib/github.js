"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollRepo = exports.getCommitHashes = void 0;
var db_1 = require("../server/db");
var axios_1 = require("axios");
var octokit_1 = require("octokit");
var octokit = new octokit_1.Octokit({ auth: process.env.GITHUB_TOKEN });
var getCommitHashes = function (githubUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, owner, repo, data, sortedCommits;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = githubUrl.split("/").slice(-2), owner = _a[0], repo = _a[1];
                return [4 /*yield*/, octokit.request("GET /repos/".concat(owner, "/").concat(repo, "/commits"))];
            case 1:
                data = (_b.sent()).data;
                sortedCommits = data.sort(function (a, b) {
                    return new Date(b.commit.author.date).getTime() -
                        new Date(a.commit.author.date).getTime();
                });
                return [2 /*return*/, sortedCommits.slice(0, 15).map(function (commit) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        return ({
                            commitHash: commit.sha,
                            commitMessage: (_a = commit.commit.message) !== null && _a !== void 0 ? _a : "",
                            commitAuthorName: (_d = (_c = (_b = commit.commit) === null || _b === void 0 ? void 0 : _b.author) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "",
                            commitAuthorAvatar: (_f = (_e = commit.author) === null || _e === void 0 ? void 0 : _e.avatar_url) !== null && _f !== void 0 ? _f : "",
                            commitDate: (_j = (_h = (_g = commit.commit) === null || _g === void 0 ? void 0 : _g.author) === null || _h === void 0 ? void 0 : _h.date) !== null && _j !== void 0 ? _j : "",
                        });
                    })];
        }
    });
}); };
exports.getCommitHashes = getCommitHashes;
var pollRepo = function (githubUrl, projectId) { return __awaiter(void 0, void 0, void 0, function () {
    var commitHases, processedCommits, unprocessedCommits, summariesResponse, summaries, commits;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getCommitHashes)(githubUrl)];
            case 1:
                commitHases = _a.sent();
                return [4 /*yield*/, db_1.db.commit.findMany({
                        where: {
                            projectId: projectId,
                        },
                    })];
            case 2:
                processedCommits = _a.sent();
                unprocessedCommits = commitHases.filter(function (hash) {
                    return !processedCommits.some(function (commit) { return commit.commitHash === hash.commitHash; });
                });
                return [4 /*yield*/, Promise.allSettled(unprocessedCommits.map(function (hash) {
                        return axios_1.default.post("".concat(process.env.PYTHON_AI_BACKEND_URL, "/summarise-commit"), {
                            github_url: githubUrl,
                            commitHash: hash.commitHash,
                        });
                    }))];
            case 3:
                summariesResponse = _a.sent();
                summaries = summariesResponse.map(function (summary) {
                    if (summary.status === "fulfilled") {
                        return summary.value.data.summary;
                    }
                });
                return [4 /*yield*/, db_1.db.commit.createMany({
                        data: summaries.map(function (summary, idx) { return ({
                            projectId: projectId,
                            commitHash: unprocessedCommits[idx].commitHash,
                            summary: summary,
                            commitAuthorName: unprocessedCommits[idx].commitAuthorName,
                            commitDate: unprocessedCommits[idx].commitDate,
                            commitMessage: unprocessedCommits[idx].commitMessage,
                            commitAuthorAvatar: unprocessedCommits[idx].commitAuthorAvatar,
                        }); }),
                    })];
            case 4:
                commits = _a.sent();
                return [2 /*return*/, commits];
        }
    });
}); };
exports.pollRepo = pollRepo;
await (0, exports.pollRepo)("https://github.com/mafia-creater/UberClone", "cm6nmfvgn000issijti1s1fmg").then(console.log);
