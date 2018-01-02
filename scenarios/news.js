'use strict';

class News {
  constructor() {
    console.log('News starting...');
  }

  news(id, f) {

    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
                image_url: "http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
                subtitle: "Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              },
              {
                title: "VietinBank tuyển dụng gần 300 nhân sự cho chi nhánh",
                image_url: "https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
                subtitle: "Đáp ứng yêu cầu nhân sự cho chiến lược phát triển, Ngân hàng TMCP Công Thương Việt Nam (VietinBank) tuyển dụng gần 300 chỉ tiêu tại các vị trí nghiệp vụ và hỗ trợ tín dụng cho các chi nhánh trên toàn hệ thống...",
                default_action: {
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              },
              {
                title: "VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
                image_url: "http://image.bnews.vn/MediaUpload/Medium/2017/05/04/090646-bo-nhan-dien-thuong-hieu-vietinbank-2017-1.jpg",
                subtitle: "Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
  }

  newsKM(id, f) {
    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "Hoàn tiền cho chủ thẻ tín dụng quốc tế VietinBank tại Lotte Mart",
                image_url: "http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
                subtitle: "Chào mừng ngày lễ lớn của đất nước, VietinBank triển khai Chương trình Khuyến mãi tưng bừng - chào mừng Quốc khánh",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/Hoan-15-cho-chu-the-tin-dung-quoc-te-VietinBank-tai-Lotte-Mart-20170829154910.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/Hoan-15-cho-chu-the-tin-dung-quoc-te-VietinBank-tai-Lotte-Mart-20170829154910.html",
                  title: "Xem chi tiết"
                }, {
                  type: "web_url",
                  title: "Đăng ký mở thẻ",
                  payload: "NEWS_BOT"
                }]
              },
              {
                title: "Western Union - Nhận tiền - Trúng thưởng",
                image_url: "https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
                subtitle: "Từ 1/9/2017 - 31/12/2017, VietinBank tổ chức chương trình khuyến mãi dịch vụ ABMT: “Western Union - Nhận tiền - Trúng thưởng”. Chương trình được tổ chức để tri ân khách hàng...",
                default_action: {
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
  }

  newsSP(id, f) {
    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "VietinBank là ngân hàng duy nhất phát hành thẻ Diners Club tại Việt Nam",
                image_url: "http://baochinhphu.vn/Uploaded/nguyenvanhuan/2017_09_12/119%20Vietin%20k%C3%BD%20DSC_1247.jpg",
                subtitle: "Ngày 11/9/2017 tại Hà Nội, VietinBank tổ chức Lễ ký kết Hợp đồng hợp tác toàn diện với Tổ chức thẻ Diners Club International (DCI). Với thỏa thuận này, VietinBank sẽ là ngân hàng độc quyền trong việc phát hành dòng sản phẩm thẻ Diners Club tại thị trường Việt Nam...",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-la-ngan-hang-duy-nhat-phat-hanh-the-Diners-Club-tai-Viet-Nam-20170912084406.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-la-ngan-hang-duy-nhat-phat-hanh-the-Diners-Club-tai-Viet-Nam-20170912084406.html",
                  title: "Xem chi tiết"
                }, {
                  type: "web_url",
                  title: "Đăng ký mở thẻ",
                  url: "https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html"
                }]
              },
              {
                title: "VietinBank thu hộ tiền vé máy bay cho Jetstar Pacific Airlines",
                image_url: "http://vemaybaygiarevietmy.com/image/data/hang-hang-khong/jetstar-pacific-airlines/bl-ve-may-bay-jetstar-pacific-gia-re01.png",
                subtitle: "Từ ngày 21/8/2017, VietinBank cung cấp dịch vụ thu hộ tiền vé máy bay dành cho các Đại lý của Jetstar Pacific Airlines (JPA) và các khách hàng đã đặt chỗ thành công trên hệ thống JPA",
                default_action: {
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Mua vé máy bay",
                  payload: "menu:PAY_ELECTRIC"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
  }
  
  menu(id, f) {
    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "Tìm ATM gần nhất",
                image_url: "http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
                subtitle: "",
                default_action: {
                  type: "web_url",
                  url: ""
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                },
                buttons: [{
                  type: "web_url",
                  url: "http://www.vietinbank.vn/vn/tin-tuc/Hoan-15-cho-chu-the-tin-dung-quoc-te-VietinBank-tai-Lotte-Mart-20170829154910.html",
                  title: "Xem chi tiết"
                }, {
                  type: "web_url",
                  title: "Đăng ký mở thẻ",
                  payload: "menu:LOCATION_PAYLOAD"
                }]
              },
              {
                title: "Thông tin khuyến mại",
                image_url: "https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
                subtitle: "",
                default_action: {
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html"
                  //messenger_extensions: true,
                  //webview_height_ratio: "tall",
                  //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                },
                buttons: [{
                  type: "web_url",
                  url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
                  title: "Xem chi tiết"
                }, {
                  type: "postback",
                  title: "Đăng ký nhận tin",
                  payload: "NEWS_BOT"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
  }
}

module.exports = News;