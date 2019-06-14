const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio');
const app = express()
var path = require('path');
var fs = require('fs');
var https=require('https')

let hotNews = []
let localNews = []


var privateKey  = fs.readFileSync(path.join(__dirname, './certificate/private.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, './certificate/file.crt'), 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);

let getHotNews = (res) => {
  let hotNews = [];
  // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res.text中。

  /* 使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
     以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
   */
  let $ = cheerio.load(res.text);

  // 找到目标数据所在的页面元素，获取数据
  $('.key-list dt').each((idx, ele) => {
    // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
    // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
    let news = {
      title: $(ele).find('a').text(),        // 获取新闻标题
      href: $(ele).find('a').attr('href'),
      date:$(ele).find('span').text()// 获取新闻网页链接
    };
    hotNews.push(news)              // 存入最终结果数组
  });
  return hotNews
};


app.get('/getGwyData', function (req, res1) {
  superagent.get('http://rsj.huangshan.gov.cn/Content/showList/JA012/16343/1/page_1.html').end((err, res) => {
    if (err) {
      // 如果访问失败或者出错，会这行这里
      console.log(`热点新闻抓取失败 - ${err}`)
    } else {
      // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res
      // 抓取热点新闻数据
      hotNews = getHotNews(res)
    }
    res1.send(hotNews);
  });
})
let server = httpsServer.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at http://%s:%s', host, port);
})