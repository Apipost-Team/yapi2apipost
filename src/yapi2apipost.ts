import MockSchema from 'apipost-mock-schema';
// import 
class yapi2apipost {
  version: string;
  project: any;
  apis: any[];
  env: any[];
  constructor() {
    this.version = '1.0';
    this.project = {};
    this.apis = [];
    this.env = [];
  }
  createMode(type: string) {
    const MODE: any = {
      none: 'none',
      'form-data': 'multipart/form-data',
      urlencoded: 'application/x-www-form-urlencoded',
      json: 'application/json',
      xml: 'application/xml',
      javascript: 'application/javascript',
      plain: 'text/plain',
      html: 'text/html',
    }
    if (MODE[type]) {
      return MODE[type];
    } else {
      return 'multipart/form-data';
    }
  }
  replaceRef = (schemaObj: any) => {
    try {
      for (const key in schemaObj) {
        const value = schemaObj[key];
        // 如果当前属性的值是一个对象，则递归遍历该对象

        if (typeof value === 'object' && value !== null) {
          this.replaceRef(value);
        }
      }
    } catch (error) { }
  }
  yapiSchema2apipostSchema = (jsonSchemaStr: string) => {
    let jsonSchema: any = {};
    try {
      // // x-apifox-orders 2 APIPOST_ORDERS x-apifox-refs 2 APIPOST_REFS  $ref 2 ref  x-apifox-overrides 2 APIPOST_OVERRIDES
      // // 替换 x-apifox-orders 为 APIPOST_ORDERS
      // jsonSchemaStr = jsonSchemaStr.replace(/\"x-apifox-orders\"/g, '\"APIPOST_ORDERS\"');
      // // 替换 x-apifox-refs 为 APIPOST_REFS
      // jsonSchemaStr = jsonSchemaStr.replace(/\"x-apifox-refs\"/g, '\"APIPOST_REFS\"');
      // // 替换 $ref 为 ref
      // jsonSchemaStr = jsonSchemaStr.replace(/\"\$ref\"/g, '\"ref\"');
      // // 替换 $ref 为 ref
      // jsonSchemaStr = jsonSchemaStr.replace(/\"\$\$ref\"/g, '\"ref\"');
      // // 替换 x-apifox-overrides 为 APIPOST_OVERRIDES
      // jsonSchemaStr = jsonSchemaStr.replace(/\"x-apifox-overrides\"/g, '\"APIPOST_OVERRIDES\"');
      // 还原为对象
      jsonSchema = JSON.parse(jsonSchemaStr);

      this.replaceRef(jsonSchema)
    } catch (error) { }

    return jsonSchema;
  }
  ConvertResult(status: string, message: string, data: any = '') {
    return {
      status,
      message,
      data
    }
  }
  validate(json: any) {
    // if (!json.hasOwnProperty('projectInfo')) {
    //   return this.ConvertResult('error', 'Must contain a ApipostJson field');
    // }
    if (!(json instanceof Array)) {
      return this.ConvertResult('error', 'Must contain a yapiJson field');
    }
    return this.ConvertResult('success', '');
  }
  handleInfo(json: any) {
    this.project.name = json?.info?.title || '新建项目';
    this.project.description = json?.info?.description || '';
  }
  createFolder(item: any) {
    var newFolder = {
      'name': item?.name || '新建目录',
      'target_type': 'folder',
      'description': item?.desc || '',
      'children': [],
    };
    return newFolder;
  }
  async createApis(item: any) {
    var api: any = {
      name: item?.title || '新建接口',
      target_type: 'api',
      url: item?.path || "",
      method: item?.method.toUpperCase() || 'GET',
      tags: item?.tag || [],
      request: {
        'query': [],
        'header': [],
        'description': item?.desc || '',
      },
      response: {
        success: {
          parameter: [],
          raw: '',
          expect: {}
        },
        error: {
          parameter: [],
          raw: '',
          expect: {}
        }
      }
    }
    const { request, response } = api;
    if (item.hasOwnProperty('req_query') && item.req_query instanceof Array) {
      for (const query of item.req_query) {
        query.name && request.query.push({
          is_checked: "1",
          type: 'Text',
          key: query?.name || '',
          value: query?.value || query?.example || '',
          not_null: "1",
          description: query?.desc || '',
          field_type: "Text"
        })
      }
    }
    if (item.hasOwnProperty('req_headers') && item.req_headers instanceof Array) {
      for (const header of item.req_headers) {
        header.name && request.header.push({
          is_checked: "1",
          type: 'Text',
          key: header?.name || '',
          value: header?.value || header?.example || '',
          not_null: "1",
          description: header?.desc || '',
          field_type: "Text"
        })
      }
    }
    if (item.hasOwnProperty('req_body_type')) {
      request.body = {
        "mode": "none",
        "parameter": [],
        "raw": '',
        "raw_para": [],
        "raw_schema": {}
      }
      if (item.req_body_type == 'form' && item.hasOwnProperty('req_body_form') && item.req_body_form instanceof Array) {
        request.body.mode = 'form-data';
        for (const form of item.req_body_form) {
          form.name && request.body.parameter.push({
            is_checked: "1",
            type: form.hasOwnProperty('type') && form.type == 'file' ? 'File' : 'Text',
            key: form?.name || "",
            value: form?.example || "",
            not_null: "1",
            description: form?.desc || "",
            field_type: "Text"
          })
        }
      }
      //  else if (item.req_body_type == 'json' && item.hasOwnProperty('res_body')) {
      //   try {
      //     if (Object.prototype.toString.call(item.res_body) !== '[object Object]') {
      //       item.res_body = JSON.parse(item.res_body);
      //     }
      //   } catch (error) { }
      //   request.body.mode = 'json';
      //   if (item.res_body.hasOwnProperty('type')) {
      //     request.body.raw_schema = item.res_body;
      //   }
      // }
      else {
        if (Object.prototype.toString.call(item?.req_body_other) === '[object String]') {
          try {
            request.body.raw_schema = this.yapiSchema2apipostSchema(item?.req_body_other);
            const newSchema = new MockSchema();
            let jsonExample = await newSchema.mock(JSON.parse(item?.req_body_other) || {});
            request.body.raw = JSON.stringify(jsonExample);
          } catch (error) {
            request.body.raw = item?.req_body_other || ''
          }
        } else {
          request.body.raw = item?.req_body_other || ''
        }
        request.body.mode = 'json';
      }
    }
    if (item.hasOwnProperty('res_body_type')) {
      response.success = {
        "parameter": [],
        "raw": '',
        "expect": {
          name: '成功',
          isDefault: 1,
          code: '200',
          contentType: "json",
          schema: {},
          mock: "",
          verifyType: "schema",
        },
      }
      if (item.res_body_type == 'json' && item.hasOwnProperty('res_body')) {
        try {
          if (Object.prototype.toString.call(item?.res_body) !== '[object Object]') {
            response.success.expect.schema = this.yapiSchema2apipostSchema(item?.res_body);
            const newSchema = new MockSchema();
            let jsonExample = await newSchema.mock(JSON.parse(item?.res_body) || {});
            response.success.raw = JSON.stringify(jsonExample) || ''
          }
        } catch (error) { }
      }
    }
    return api;
  }
  async handleData(json: any[], parent: any = null) {
    for (const item of json) {
      let target;
      if (item.hasOwnProperty('list') && item.list instanceof Array) {
        target = this.createFolder(item);
        await this.handleData(item.list, target);
      } else {
        target = await this.createApis(item);
      }
      if (parent && parent != null && parent.hasOwnProperty('children')) {
        parent.children.push(target);
      } else {
        this.apis.push(target);
      }
    }
  }
  async convert(json: any) {
    try {
      var validationResult = this.validate(json);
      if (validationResult.status === 'error') {
        return validationResult;
      }
      this.handleInfo(json);
      await this.handleData(json, null)
      validationResult.data = {
        project: this.project,
        apis: this.apis
      };
      console.log('api', JSON.stringify(validationResult.data.apis));
      return validationResult;
    } catch (error) {
      return this.ConvertResult('error', String(error))
    }
  }
}

export default yapi2apipost;
