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
  createApis(item: any) {
    var api: any = {
      name: item?.title || '新建接口',
      target_type: 'api',
      url: item?.path || "",
      method: item?.method.toUpperCase() || 'GET',
      request: {
        'query': [],
        'header': [],
        'description': item?.desc || '',
      }
    }
    const { request } = api;
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
        "raw_para": []
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
      }else{
        request.body.mode = 'json';
        request.body.raw=item?.req_body_other || ''
      }
    }
    return api;
  }
  handleData(json: any[], parent: any = null) {
    for (const item of json) {
      let target;
      if (item.hasOwnProperty('list') && item.list instanceof Array) {
        target = this.createFolder(item);
        this.handleData(item.list, target);
      } else {
        target = this.createApis(item);
      }
      if (parent && parent != null && parent.hasOwnProperty('children')) {
        parent.children.push(target);
      } else {
        this.apis.push(target);
      }
    }
  }
  convert(json: any) {
    try {
      var validationResult = this.validate(json);
      if (validationResult.status === 'error') {
        return validationResult;
      }
      this.handleInfo(json);
      this.handleData(json, null)
      validationResult.data = {
        project: this.project,
        apis: this.apis
      };
      console.log('api', JSON.stringify(validationResult));
      return validationResult;
    } catch (error) {
      return this.ConvertResult('error', String(error))
    }
  }
}

export default yapi2apipost;
