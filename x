CMMS server: - running on 3 of 4 CPU Cores
==================================
Pool Grows To:
  1:127.0.0.1:38108
==================================
==================================
Pool Grows To:
  1:127.0.0.1:38108
  2:127.0.0.1:38119
==================================
==================================
Pool Grows To:
  1:127.0.0.1:38108
  2:127.0.0.1:38119
  3:127.0.0.1:38120
==================================
Publish event machine 4
==================================
Pool Shrinks To:
  1:127.0.0.1:38119
  2:127.0.0.1:38120
==================================
Publish event tool 1
Publish event event 16
Publish event machine 4
Publish event tool 2
Publish event event 18
Publish event machine 4
Publish event tool 4
Publish event event 20
{"_t":"2015-12-19T13:26:12+1030", "_p":"21866", "_l":"ERR", "_n":"dat:sqlx", "_m":"exec.30", "err":"pq: column \"is_running\" of relation \"component\" does not exist", "_c":"/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:48 (0x6ece3c)\n\t(*JSONFormatter).writeError: jf.set(buf, KeyMap.CallStack, string(debug.Stack()))\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:89 (0x6ed226)\n\t(*JSONFormatter).appendValue: jf.writeError(buf, err)\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:127 (0x6eddf7)\n\t(*JSONFormatter).set: jf.appendValue(buf, val)\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:174 (0x6ee657)\n\t(*JSONFormatter).Format: jf.set(buf, key, args[i+1])\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:117 (0x6e5ca2)\n\t(*DefaultLogger).Log: l.formatter.Format(l.writer, level, msg, args)\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:94 (0x6e59a8)\n\t(*DefaultLogger).extractLogError: return err\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:102 (0x6e5ace)\n\t(*DefaultLogger).Error: return l.extractLogError(LevelError, msg, args)\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/exec.go:60 (0x538d5a)\n\tlogSQLError: return logger.Error(msg, \"err\", err, \"sql\", statement, \"args\", toOutputStr(args))\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/exec.go:99 (0x53a12f)\n\texec: return nil, logSQLError(err, \"exec.30\", fullSQL, args)\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/execer.go:39 (0x53eca1)\n\t(*Execer).Exec: res, err := exec(ex)\n/home/steve/go/src/github.com/steveoc64/cmms/rest_event.go:294 (0x40b96b)\n\traiseEventTool: Exec()\n/home/steve/go/src/github.com/labstack/echo/echo.go:566 (0x4b39ca)\n\twrapMiddleware.func1.1.1: err = h(c)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/thoas/stats/stats.go:51 (0x5c99be)\n\t(*Stats).Handler.func1: h.ServeHTTP(recorder, r)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/labstack/echo/echo.go:567 (0x4b3b94)\n\twrapMiddleware.func1.1: })).ServeHTTP(c.response.writer, c.request)\n/home/steve/go/src/github.com/labstack/echo/echo.go:566 (0x4b39ca)\n\twrapMiddleware.func1.1.1: err = h(c)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/rs/cors/cors.go:188 (0x4dee95)\n\t(*Cors).Handler.func1: h.ServeHTTP(w, r)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/labstack/echo/echo.go:567 (0x4b3b94)\n\twrapMiddleware.func1.1: })).ServeHTTP(c.response.writer, c.request)\n/home/steve/go/src/github.com/labstack/echo/middleware/compress.go:67 (0x4b5add)\n\tGzip.func1.1: if err := h(c); err != nil {\n/home/steve/go/src/github.com/labstack/echo/middleware/recover.go:25 (0x4b6936)\n\tRecover.func1.1: return h(c)\n/home/steve/go/src/github.com/labstack/echo/middleware/logger.go:28 (0x4b5dc3)\n\tLogger.func1.1: if err := h(c); err != nil {\n/home/steve/go/src/github.com/labstack/echo/echo.go:476 (0x4ad506)\n\t(*Echo).ServeHTTP: if err := h(c); err != nil {\n/usr/local/go/src/net/http/server.go:1862 (0x59d59e)\n\tserverHandler.ServeHTTP: handler.ServeHTTP(rw, req)\n/usr/local/go/src/net/http/server.go:1361 (0x59adee)\n\t(*conn).serve: serverHandler{c.server}.ServeHTTP(w, w.req)\n/usr/local/go/src/runtime/asm_amd64.s:1696 (0x4908d1)\n\tgoexit: BYTE\t$0x90\t// NOP\n", "sql":"update component\n\t\t\tset status='Stopped', is_running=false\n\t\t\twhere id=3", "args":"nil"}
==================================
Pool Grows To:
  1:127.0.0.1:38119
  2:127.0.0.1:38120
  3:127.0.0.1:38129
==================================
{"_t":"2015-12-19T13:26:30+1030", "_p":"21866", "_l":"ERR", "_n":"dat:sqlx", "_m":"exec.30", "err":"pq: column \"is_running\" of relation \"component\" does not exist", "_c":"/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:48 (0x6ece3c)\n\t(*JSONFormatter).writeError: jf.set(buf, KeyMap.CallStack, string(debug.Stack()))\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:89 (0x6ed226)\n\t(*JSONFormatter).appendValue: jf.writeError(buf, err)\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:127 (0x6eddf7)\n\t(*JSONFormatter).set: jf.appendValue(buf, val)\n/home/steve/go/src/github.com/mgutz/logxi/v1/jsonFormatter.go:174 (0x6ee657)\n\t(*JSONFormatter).Format: jf.set(buf, key, args[i+1])\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:117 (0x6e5ca2)\n\t(*DefaultLogger).Log: l.formatter.Format(l.writer, level, msg, args)\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:94 (0x6e59a8)\n\t(*DefaultLogger).extractLogError: return err\n/home/steve/go/src/github.com/mgutz/logxi/v1/defaultLogger.go:102 (0x6e5ace)\n\t(*DefaultLogger).Error: return l.extractLogError(LevelError, msg, args)\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/exec.go:60 (0x538d5a)\n\tlogSQLError: return logger.Error(msg, \"err\", err, \"sql\", statement, \"args\", toOutputStr(args))\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/exec.go:99 (0x53a12f)\n\texec: return nil, logSQLError(err, \"exec.30\", fullSQL, args)\n/home/steve/go/src/gopkg.in/mgutz/dat.v1/sqlx-runner/execer.go:39 (0x53eca1)\n\t(*Execer).Exec: res, err := exec(ex)\n/home/steve/go/src/github.com/steveoc64/cmms/rest_event.go:294 (0x40b96b)\n\traiseEventTool: Exec()\n/home/steve/go/src/github.com/labstack/echo/echo.go:566 (0x4b39ca)\n\twrapMiddleware.func1.1.1: err = h(c)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/thoas/stats/stats.go:51 (0x5c99be)\n\t(*Stats).Handler.func1: h.ServeHTTP(recorder, r)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/labstack/echo/echo.go:567 (0x4b3b94)\n\twrapMiddleware.func1.1: })).ServeHTTP(c.response.writer, c.request)\n/home/steve/go/src/github.com/labstack/echo/echo.go:566 (0x4b39ca)\n\twrapMiddleware.func1.1.1: err = h(c)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/rs/cors/cors.go:188 (0x4dee95)\n\t(*Cors).Handler.func1: h.ServeHTTP(w, r)\n/usr/local/go/src/net/http/server.go:1422 (0x59b32a)\n\tHandlerFunc.ServeHTTP: f(w, r)\n/home/steve/go/src/github.com/labstack/echo/echo.go:567 (0x4b3b94)\n\twrapMiddleware.func1.1: })).ServeHTTP(c.response.writer, c.request)\n/home/steve/go/src/github.com/labstack/echo/middleware/compress.go:67 (0x4b5add)\n\tGzip.func1.1: if err := h(c); err != nil {\n/home/steve/go/src/github.com/labstack/echo/middleware/recover.go:25 (0x4b6936)\n\tRecover.func1.1: return h(c)\n/home/steve/go/src/github.com/labstack/echo/middleware/logger.go:28 (0x4b5dc3)\n\tLogger.func1.1: if err := h(c); err != nil {\n/home/steve/go/src/github.com/labstack/echo/echo.go:476 (0x4ad506)\n\t(*Echo).ServeHTTP: if err := h(c); err != nil {\n/usr/local/go/src/net/http/server.go:1862 (0x59d59e)\n\tserverHandler.ServeHTTP: handler.ServeHTTP(rw, req)\n/usr/local/go/src/net/http/server.go:1361 (0x59adee)\n\t(*conn).serve: serverHandler{c.server}.ServeHTTP(w, w.req)\n/usr/local/go/src/runtime/asm_amd64.s:1696 (0x4908d1)\n\tgoexit: BYTE\t$0x90\t// NOP\n", "sql":"update component\n\t\t\tset status='Stopped', is_running=false\n\t\t\twhere id=14", "args":"nil"}
==================================
Pool Grows To:
  1:127.0.0.1:38119
  2:127.0.0.1:38120
  3:127.0.0.1:38129
  4:127.0.0.1:38135
==================================
Publish event machine 10
==================================
Pool Shrinks To:
  1:127.0.0.1:38135
==================================
Publish event tool 47
Publish event event 26
Publish event machine 10
Publish event tool 47
Publish event event 28
==================================
Pool Grows To:
  1:127.0.0.1:38135
  2:127.0.0.1:38283
==================================
==================================
Pool Grows To:
  1:127.0.0.1:38135
  2:127.0.0.1:38283
  3:127.0.0.1:38289
==================================
==================================
Pool Grows To:
  1:127.0.0.1:38135
  2:127.0.0.1:38283
  3:127.0.0.1:38289
  4:127.0.0.1:38304
==================================
