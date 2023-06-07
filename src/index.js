
module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('yujian', {
      handle,
      name: '遇见图床',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.yujian')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }

    const url = userConfig.url
    const paramName = "image"
    const jsonPath = "data.url.distribute"
    const customHeader = ""
    const apiType = userConfig.apiType
    const token = userConfig.token
    const customBody = ""
    
    try {
      let imgList = ctx.output
  
      for (let i in imgList) {
        
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, customHeader, customBody, url, paramName, imgList[i].fileName, token, apiType)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        if (!jsonPath) {
          imgList[i]['imgUrl'] = body
        } else {
          body = JSON.parse(body)
          let imgUrl = body
          for (let field of jsonPath.split('.')) {
            imgUrl = imgUrl[field]
          }
          if (imgUrl) {
            imgList[i]['imgUrl'] = imgUrl
          } else {
            ctx.emit('notification', {
              title: '返回解析失败',
              body: '请检查JsonPath设置'
            })
          }
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, customHeader, customBody, url, paramName, fileName, token, apiType) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    if(!url){
      url = "https://www.hualigs.cn/api/upload"
    }

    if (customHeader) {
      headers = Object.assign(headers, JSON.parse(customHeader))
    }
    let formData = {}
    if (customBody) {
      formData = Object.assign(formData, JSON.parse(customBody))
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData[paramName] = {}
    opts.formData[paramName].value = image
    opts.formData[paramName].options = {
      filename: fileName
    }
    opts.formData["apiType"] = apiType
    opts.formData["token"] = token
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.yujian')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: false,
        message: 'API地址:默认不用填写',
        alias: 'API地址',
      },
      {
        name: 'apiType',
        type: 'input',
        default: userConfig.apiType,
        message: '遇见图床推荐: chaoneng',
        alias: '遇见图床类型',
        required: true
      },
      {
        name: 'token',
        type: 'input',
        default: userConfig.token,
        message: '遇见图床token',
        alias: 'Token',
        required: true
      }
    ]
  }
  return {
    uploader: 'yujian',
    
    register

  }
}
