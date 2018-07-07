// 排行榜

$('#list').on('open.collapse.amui', function () {
  $("#list .am-tabs-bd ul").html("");
  getlist();
})

function getlist() {
  $.ajax({
    url: '/rankList',
    type: 'get',
    success: function (data) {
      if (data.success) {
        var feelings = data.data.feelings;
        var length = feelings.length >= 10 ? 10 : feelings.length;
        for(var i = 0;i < length;i++){
          $(".feelings").append("<li class='am-cf'><a href='/content"+ feelings[i].id +".html'><p class='text'>《" + feelings[i].name + "》 by：" + feelings[i].author +"</p><p class='num'>"+ feelings[i].feelings +"票</p></a></li>")
        }
        var gut = data.data.gut;
        var length = gut.length >= 10 ? 10 : gut.length;
        for(var i = 0;i < length;i++){
          $(".gut").append("<li class='am-cf'><a href='/content"+ gut[i].id +".html'><p class='text'>《" + gut[i].name + "》 by：" + gut[i].author +"</p><p class='num'>"+ gut[i].gut +"票</p></a></li>")
        }
        var writing = data.data.writing;
        var length = writing.length >= 10 ? 10 : writing.length;
        for(var i = 0;i < length;i++){
          $(".writing").append("<li class='am-cf'><a href='/content"+ writing[i].id +".html'><p class='text'>《" + writing[i].name + "》 by：" + writing[i].author +"</p><p class='num'>"+ writing[i].writing +"票</p></a></li>")
        }
      }else{
        alert("啊哦，好像出错了呢，查询失败，十分抱歉！")
      }
    },
    error:function(data){
      alert("啊哦，好像出错了呢，查询失败，十分抱歉！请尝试刷新页面，或截图联系墙君！")
    }
  })
}