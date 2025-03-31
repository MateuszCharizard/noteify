"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/ai",{

/***/ "(pages-dir-browser)/./pages/ai.js":
/*!*********************!*\
  !*** ./pages/ai.js ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Chat)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(pages-dir-browser)/./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(pages-dir-browser)/./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var framer_motion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! framer-motion */ \"(pages-dir-browser)/./node_modules/framer-motion/dist/es/index.mjs\");\n/* harmony import */ var ollama_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ollama/browser */ \"(pages-dir-browser)/./node_modules/ollama/dist/browser.mjs\");\n\nvar _s = $RefreshSig$();\n\n\n\nfunction Chat() {\n    _s();\n    const [messages, setMessages] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [input, setInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const messageVariants = {\n        hidden: {\n            opacity: 0,\n            y: 20\n        },\n        visible: {\n            opacity: 1,\n            y: 0,\n            transition: {\n                duration: 0.3\n            }\n        }\n    };\n    const handleSend = async ()=>{\n        if (!input.trim()) return;\n        const userMessage = {\n            role: \"user\",\n            content: input\n        };\n        setMessages((prev)=>[\n                ...prev,\n                userMessage\n            ]);\n        setInput(\"\");\n        setLoading(true);\n        try {\n            console.log(\"Sending request to /ollama/api/chat\"); // Debug log\n            const response = await ollama_browser__WEBPACK_IMPORTED_MODULE_2__[\"default\"].chat({\n                model: \"deepseek-r1:1.5b\",\n                messages: [\n                    ...messages,\n                    userMessage\n                ],\n                host: \"http://localhost:3000/ollama\"\n            });\n            console.log(\"Response received:\", response); // Debug log\n            const aiMessage = {\n                role: \"assistant\",\n                content: response.message.content\n            };\n            setMessages((prev)=>[\n                    ...prev,\n                    aiMessage\n                ]);\n        } catch (error) {\n            console.error(\"Error fetching response:\", error);\n            setMessages((prev)=>[\n                    ...prev,\n                    {\n                        role: \"assistant\",\n                        content: \"Sorry, I couldn’t connect to the server!\"\n                    }\n                ]);\n        } finally{\n            setLoading(false);\n        }\n    };\n    const handleKeyPress = (e)=>{\n        if (e.key === \"Enter\" && !e.shiftKey) {\n            e.preventDefault();\n            handleSend();\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col h-[80vh]\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"p-4 border-b border-gray-200 dark:border-gray-800\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        className: \"text-xl font-semibold text-gray-900 dark:text-white\",\n                        children: \"Noteify Chatbot\"\n                    }, void 0, false, {\n                        fileName: \"/workspaces/noteify/pages/ai.js\",\n                        lineNumber: 56,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/workspaces/noteify/pages/ai.js\",\n                    lineNumber: 55,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"flex-1 p-4 overflow-y-auto space-y-4\",\n                    children: [\n                        messages.length === 0 ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-gray-500 dark:text-gray-400 text-center\",\n                            children: \"Start chatting by typing a message below!\"\n                        }, void 0, false, {\n                            fileName: \"/workspaces/noteify/pages/ai.js\",\n                            lineNumber: 62,\n                            columnNumber: 13\n                        }, this) : messages.map((msg, index)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(framer_motion__WEBPACK_IMPORTED_MODULE_3__.motion.div, {\n                                variants: messageVariants,\n                                initial: \"hidden\",\n                                animate: \"visible\",\n                                className: \"flex \".concat(msg.role === \"user\" ? \"justify-end\" : \"justify-start\"),\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"max-w-xs p-3 rounded-lg \".concat(msg.role === \"user\" ? \"bg-gray-900 text-white dark:bg-gray-800\" : \"bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200\"),\n                                    children: msg.content\n                                }, void 0, false, {\n                                    fileName: \"/workspaces/noteify/pages/ai.js\",\n                                    lineNumber: 76,\n                                    columnNumber: 17\n                                }, this)\n                            }, index, false, {\n                                fileName: \"/workspaces/noteify/pages/ai.js\",\n                                lineNumber: 67,\n                                columnNumber: 15\n                            }, this)),\n                        loading && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex justify-start\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"max-w-xs p-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400\",\n                                children: \"Typing...\"\n                            }, void 0, false, {\n                                fileName: \"/workspaces/noteify/pages/ai.js\",\n                                lineNumber: 90,\n                                columnNumber: 15\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/workspaces/noteify/pages/ai.js\",\n                            lineNumber: 89,\n                            columnNumber: 13\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/workspaces/noteify/pages/ai.js\",\n                    lineNumber: 60,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"p-4 border-t border-gray-200 dark:border-gray-800\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"flex gap-2\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"textarea\", {\n                                value: input,\n                                onChange: (e)=>setInput(e.target.value),\n                                onKeyPress: handleKeyPress,\n                                placeholder: \"Type your message...\",\n                                className: \"flex-1 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none\",\n                                rows: \"2\"\n                            }, void 0, false, {\n                                fileName: \"/workspaces/noteify/pages/ai.js\",\n                                lineNumber: 98,\n                                columnNumber: 13\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(framer_motion__WEBPACK_IMPORTED_MODULE_3__.motion.button, {\n                                whileHover: {\n                                    scale: 1.05\n                                },\n                                whileTap: {\n                                    scale: 0.95\n                                },\n                                onClick: handleSend,\n                                disabled: loading,\n                                className: \"px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50\",\n                                children: \"Send\"\n                            }, void 0, false, {\n                                fileName: \"/workspaces/noteify/pages/ai.js\",\n                                lineNumber: 106,\n                                columnNumber: 13\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/workspaces/noteify/pages/ai.js\",\n                        lineNumber: 97,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/workspaces/noteify/pages/ai.js\",\n                    lineNumber: 96,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/workspaces/noteify/pages/ai.js\",\n            lineNumber: 54,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/workspaces/noteify/pages/ai.js\",\n        lineNumber: 53,\n        columnNumber: 5\n    }, this);\n}\n_s(Chat, \"FpfR4LFmT6AFISP10oyeCF5r9c0=\");\n_c = Chat;\nvar _c;\n$RefreshReg$(_c, \"Chat\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU0sQ0FBQ0YsS0FBSztnQ0FDeENHLFlBQVlwQjtnQ0FDWnFCLGFBQVk7Z0NBQ1pmLFdBQVU7Z0NBQ1ZnQixNQUFLOzs7Ozs7MENBRVAsOERBQUNyRCxpREFBTUEsQ0FBQ3NELE1BQU07Z0NBQ1pDLFlBQVk7b0NBQUVDLE9BQU87Z0NBQUs7Z0NBQzFCQyxVQUFVO29DQUFFRCxPQUFPO2dDQUFLO2dDQUN4QkUsU0FBUzFDO2dDQUNUMkMsVUFBVXBEO2dDQUNWOEIsV0FBVTswQ0FDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFiO0dBbkh3Qm5DO0tBQUFBIiwic291cmNlcyI6WyIvd29ya3NwYWNlcy9ub3RlaWZ5L3BhZ2VzL2FpLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBtb3Rpb24gfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IG9sbGFtYSBmcm9tIFwib2xsYW1hL2Jyb3dzZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2hhdCgpIHtcbiAgY29uc3QgW21lc3NhZ2VzLCBzZXRNZXNzYWdlc10gPSB1c2VTdGF0ZShbXSk7XG4gIGNvbnN0IFtpbnB1dCwgc2V0SW5wdXRdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBtZXNzYWdlVmFyaWFudHMgPSB7XG4gICAgaGlkZGVuOiB7IG9wYWNpdHk6IDAsIHk6IDIwIH0sXG4gICAgdmlzaWJsZTogeyBvcGFjaXR5OiAxLCB5OiAwLCB0cmFuc2l0aW9uOiB7IGR1cmF0aW9uOiAwLjMgfSB9LFxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVNlbmQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFpbnB1dC50cmltKCkpIHJldHVybjtcblxuICAgIGNvbnN0IHVzZXJNZXNzYWdlID0geyByb2xlOiBcInVzZXJcIiwgY29udGVudDogaW5wdXQgfTtcbiAgICBzZXRNZXNzYWdlcygocHJldikgPT4gWy4uLnByZXYsIHVzZXJNZXNzYWdlXSk7XG4gICAgc2V0SW5wdXQoXCJcIik7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgcmVxdWVzdCB0byAvb2xsYW1hL2FwaS9jaGF0XCIpOyAvLyBEZWJ1ZyBsb2dcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb2xsYW1hLmNoYXQoe1xuICAgICAgICBtb2RlbDogXCJkZWVwc2Vlay1yMToxLjViXCIsXG4gICAgICAgIG1lc3NhZ2VzOiBbLi4ubWVzc2FnZXMsIHVzZXJNZXNzYWdlXSxcbiAgICAgICAgaG9zdDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvb2xsYW1hXCIsIC8vIFVzZSBhYnNvbHV0ZSBwcm94aWVkIFVSTFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiUmVzcG9uc2UgcmVjZWl2ZWQ6XCIsIHJlc3BvbnNlKTsgLy8gRGVidWcgbG9nXG4gICAgICBjb25zdCBhaU1lc3NhZ2UgPSB7IHJvbGU6IFwiYXNzaXN0YW50XCIsIGNvbnRlbnQ6IHJlc3BvbnNlLm1lc3NhZ2UuY29udGVudCB9O1xuICAgICAgc2V0TWVzc2FnZXMoKHByZXYpID0+IFsuLi5wcmV2LCBhaU1lc3NhZ2VdKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIHJlc3BvbnNlOlwiLCBlcnJvcik7XG4gICAgICBzZXRNZXNzYWdlcygocHJldikgPT4gW1xuICAgICAgICAuLi5wcmV2LFxuICAgICAgICB7IHJvbGU6IFwiYXNzaXN0YW50XCIsIGNvbnRlbnQ6IFwiU29ycnksIEkgY291bGRu4oCZdCBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIhXCIgfSxcbiAgICAgIF0pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlS2V5UHJlc3MgPSAoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiICYmICFlLnNoaWZ0S2V5KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBoYW5kbGVTZW5kKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTUwIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgbWF4LXctMnhsIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctbGcgZmxleCBmbGV4LWNvbCBoLVs4MHZoXVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS04MDBcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCI+XG4gICAgICAgICAgICBOb3RlaWZ5IENoYXRib3RcbiAgICAgICAgICA8L2gxPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgcC00IG92ZXJmbG93LXktYXV0byBzcGFjZS15LTRcIj5cbiAgICAgICAgICB7bWVzc2FnZXMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgU3RhcnQgY2hhdHRpbmcgYnkgdHlwaW5nIGEgbWVzc2FnZSBiZWxvdyFcbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgbWVzc2FnZXMubWFwKChtc2csIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICAgICAgICB2YXJpYW50cz17bWVzc2FnZVZhcmlhbnRzfVxuICAgICAgICAgICAgICAgIGluaXRpYWw9XCJoaWRkZW5cIlxuICAgICAgICAgICAgICAgIGFuaW1hdGU9XCJ2aXNpYmxlXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4ICR7XG4gICAgICAgICAgICAgICAgICBtc2cucm9sZSA9PT0gXCJ1c2VyXCIgPyBcImp1c3RpZnktZW5kXCIgOiBcImp1c3RpZnktc3RhcnRcIlxuICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgbWF4LXcteHMgcC0zIHJvdW5kZWQtbGcgJHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnJvbGUgPT09IFwidXNlclwiXG4gICAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYXktOTAwIHRleHQtd2hpdGUgZGFyazpiZy1ncmF5LTgwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBcImJnLWdyYXktMjAwIHRleHQtZ3JheS05MDAgZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0yMDBcIlxuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge21zZy5jb250ZW50fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApKVxuICAgICAgICAgICl9XG4gICAgICAgICAge2xvYWRpbmcgJiYgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktc3RhcnRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy14cyBwLTMgcm91bmRlZC1sZyBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktODAwIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XG4gICAgICAgICAgICAgICAgVHlwaW5nLi4uXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00IGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTgwMFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMlwiPlxuICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgIHZhbHVlPXtpbnB1dH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRJbnB1dChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgIG9uS2V5UHJlc3M9e2hhbmRsZUtleVByZXNzfVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlR5cGUgeW91ciBtZXNzYWdlLi4uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHAtMiByb3VuZGVkLW1kIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWdyYXktMzAwIGRhcms6Zm9jdXM6cmluZy1ncmF5LTYwMCByZXNpemUtbm9uZVwiXG4gICAgICAgICAgICAgIHJvd3M9XCIyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjA1IH19XG4gICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVNlbmR9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgYmctZ3JheS05MDAgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtbWQgZm9udC1tZWRpdW0gaG92ZXI6YmctZ3JheS04MDAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFNlbmRcbiAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn0iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJtb3Rpb24iLCJvbGxhbWEiLCJDaGF0IiwibWVzc2FnZXMiLCJzZXRNZXNzYWdlcyIsImlucHV0Iiwic2V0SW5wdXQiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsIm1lc3NhZ2VWYXJpYW50cyIsImhpZGRlbiIsIm9wYWNpdHkiLCJ5IiwidmlzaWJsZSIsInRyYW5zaXRpb24iLCJkdXJhdGlvbiIsImhhbmRsZVNlbmQiLCJ0cmltIiwidXNlck1lc3NhZ2UiLCJyb2xlIiwiY29udGVudCIsInByZXYiLCJjb25zb2xlIiwibG9nIiwicmVzcG9uc2UiLCJjaGF0IiwibW9kZWwiLCJob3N0IiwiYWlNZXNzYWdlIiwibWVzc2FnZSIsImVycm9yIiwiaGFuZGxlS2V5UHJlc3MiLCJlIiwia2V5Iiwic2hpZnRLZXkiLCJwcmV2ZW50RGVmYXVsdCIsImRpdiIsImNsYXNzTmFtZSIsImgxIiwibGVuZ3RoIiwicCIsIm1hcCIsIm1zZyIsImluZGV4IiwidmFyaWFudHMiLCJpbml0aWFsIiwiYW5pbWF0ZSIsInRleHRhcmVhIiwidmFsdWUiLCJvbkNoYW5nZSIsInRhcmdldCIsIm9uS2V5UHJlc3MiLCJwbGFjZWhvbGRlciIsInJvd3MiLCJidXR0b24iLCJ3aGlsZUhvdmVyIiwic2NhbGUiLCJ3aGlsZVRhcCIsIm9uQ2xpY2siLCJkaXNhYmxlZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-browser)/./pages/ai.js\n"));

/***/ })

});