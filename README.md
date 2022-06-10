yapi2apipost 是一个yapi JSON 到 apipost json 数据 的转换器。

# 🎉 特性

- 支持格式 
- yapi JSON
# 安装

```shell
npm i yapi2apipost
```

# 基础使用
需引入：

```js
import yapi2apipost from 'yapi2apipost';
const converter = new yapi2apipost();
const convertResult= converter.convert(yapiJson);
```
**检查结果:**

```js
convertResult.status === "error"
```
**对于不成功的转换。检查 convertResult.message**

```js
convertResult.status === "success"
```
**成功转换,结果在convertResult.data中**

# 开源协议

yapi2apipost 遵循 [MIT 协议](https://github.com/Apipost-Team/yapi2apipost)。
