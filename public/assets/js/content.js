// 投票请求
function upup(id) {
  var mac = navigator.userAgent;
  var type = $(".vote_box input:checked").val();
  $.ajax({
    url: '/vote',
    type: 'post',
    data: {
      mac: mac,
      id: id,
      type: type
    },
    success: function (data) {
      if (data.success) {
        $(".vote_box").css("display", "none");
        $(".ticket_box").css("display", "block");
        list(id);
      } else {
        alert("啊哦，好像出错了呢，投票失败，十分抱歉！错误信息：" + data.msg)
      }
    },
    error: function (data) {
      alert("啊哦，好像出错了呢，投票失败，十分抱歉！请尝试刷新页面，或截图联系墙君！")
    }
  })
}
// 得票数请求
function list(id) {
  $.ajax({
    url: '/getTicketNumbers',
    type: 'post',
    data: {
      id: id
    },
    success: function (data) {
      if (data.success) {
        var writing = data.data.writing;
        var gut = data.data.gut;
        var feelings = data.data.feelings;
        $(".ticket_box .writing span").html(writing);
        $(".ticket_box .gut span").html(gut);
        $(".ticket_box .feelings span").html(feelings);
      } else {
        alert("啊哦，好像出错了呢，没能获取到最新的投票数据，十分抱歉！错误信息：" + data.msg)
      }
    },
    error: function (data) {
      alert("啊哦，好像出错了呢，没能获取到最新的投票数据，十分抱歉！你还可以到首页去看得票排行榜哟，比心心！")
    }
  })
}