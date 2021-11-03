const Binance = require('node-binance-api');
const binance = new Binance().options({});
var RSI = require('technicalindicators').RSI;
const TelegramBot = require('node-telegram-bot-api');
const token = '2069468208:AAF434LevirOxj_HQZV5cfM0r6GkBdSotj8';
const chatId=1497494659;
const bot = new TelegramBot(token, {polling: true});
var rsi_set=35;
var so_sanh='<';
//t.me/News_signal_bot
var symbols=[
  'BTCUSDT',
  'NEARUSDT',
  'PHAUSDT',
  'BNBUSDT',
  'ETHUSDT',
  'DOTUSDT',
  'ALICEUSDT',
  'SOLUSDT',
  'ICPUSDT',
  'C98USDT',
  'ADAUSDT',
  'SHIBUSDT',
  'LINKUSDT',
  'SRMUSDT',
  'TRXUSDT',
]
var data_all=[];
////////////////////////////////
// down
// const time="1w"
const time="1h"
////////////////////////////////
main();
// data_set();
async function main(){
  let symbol_flolow='';
  symbols.forEach(e => {
    symbol_flolow+=`${e}; `
  });
  bot.sendMessage(chatId, `Tìm kiếm những thông tin rsi ${so_sanh} ${rsi_set};Của những đồng coin sau : 
${symbol_flolow}`);
  let list_symbol=symbols;
  get_data_socket(list_symbol);
}
// khoi tao socket lay data
//
async function get_data_socket(list_symbol){

  binance.websockets.chart(list_symbol, time, (symbol, interval, chart) => {
  // binance.websockets.chart("BTCUSDT", time, (symbol, interval, chart) => {
      let array_data=[];
      Object.keys(chart).forEach(function(key) {
        array_data.push(chart[key].close);
      })
      array_data.pop();
      //
      data_all[symbol]={
        list_close:array_data,
      };
      ///
  },300);

}

// Bot telegram here
bot.on('message', (msg) => {
  // const chatId = msg.chat.id;
  // console.log(chatId)
  if(msg.text.toUpperCase()=="ALL"){
    check_symbol_ok(true,true);
  }else{
    let message_arr=msg.text.toUpperCase().split(" ");
    if(message_arr.length != 3 || message_arr[0] != "RSI"){
      bot.sendMessage(chatId, `Bạn điền không đúng cú pháp rồi:
  "[RSI][cách][ký tự so sánh > or <][cách][số RSI cần so sánh]"`);
    }else{
      let pp_ss="[ERROR]";
      if(message_arr[1]==">") pp_ss="LỚN HƠN";
      if(message_arr[1]=="<") pp_ss="NHỎ HƠN";
      if(pp_ss!="[ERROR]"){
        so_sanh=message_arr[1];
        rsi_set=Number(message_arr[2]);
        bot.sendMessage(chatId, `Ok, tìm kiếm những thông tin rsi ${pp_ss} ${message_arr[2]}; chúng tôi sẽ thông báo!`);
        check_symbol_ok(true);
      }else{
        bot.sendMessage(chatId, `Có gì đó sai sót trong cú pháp của bạn, bạn cần nên xem lại!`);
      }
    }
  }
});



setTimeout(()=>{
    check_symbol_ok(true);
},60000)
setInterval(()=>{
  let d = new Date();
  let minute = d.getMinutes();
  if(minute==5){
    check_symbol_ok(false);
  }
},40000)



// function xu ly data
function check_symbol_ok(is_show_no,is_all=false){
  let result_symbols_rsi='';
  let rsi_set_private=rsi_set;
  let so_sanh_private=so_sanh;
  if(is_all) rsi_set_private=1;
  if(is_all) so_sanh_private='>';

  Object.keys(data_all).forEach(function(key) {
    let array_close_prices=data_all[key].list_close;
    let rsi=RSI.calculate({values:array_close_prices,period : 30});
    let l= rsi.length-1;
    if(so_sanh_private==">"){
      if(rsi[l]>rsi_set_private){
        result_symbols_rsi+=(`-----${key.replace("USDT", "/USDT")}-----: RSI > ${rsi[l]}
`)
      }
    }else if(so_sanh_private=="<"){
      if(rsi[l]<rsi_set_private){
        result_symbols_rsi+=(`-----${key.replace("USDT", "/USDT")}-----: RSI < ${rsi[l]}
`)
      }
    }
  })
  if(result_symbols_rsi!=''){
    bot.sendMessage(chatId, result_symbols_rsi);
  }else{
    if(is_show_no==true){
      bot.sendMessage(chatId, `Hiện tại chưa có data nào thỏa điều kiện RSI ${so_sanh} ${rsi_set} `);
    }
  }
}
