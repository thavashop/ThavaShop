$('#comment-form button').on('click', function (e) {
    e.preventDefault();
    if ($("#comment-content").val() && $("#name").val()) {
        $.post('/category/post-comment', {
            content: $("#comment-content").val(),
            productId: $("#product-id").val(),
            name: $("#name").val(),
            slug: $("#slug").val(),
        }, function (data) {
            if ($("#comment-page").val() == 1) {
                const commentTemplate = Handlebars.compile(
                    document.getElementById("comment-template").innerHTML);
                const commentHtml = commentTemplate(data);
                $("#comment-list").prepend(commentHtml);
                if ($("#comment-list").children().length > 6) {
                    $("#comment-list").children().last().remove();
                }
            }
            $("#comment-content")[0].value = '';
            let numberComment = $("#comments-size")[0].innerHTML;
            let words = numberComment.split(" ");
            words[0]++;
            $("#comments-size")[0].innerHTML = `${words[0]} comments`;
            if (words[0] % 6 == 1) {
                data.slug = $("#slug").val();
                data.page = $(".pagination").children().length + 1;
                data.pageIndex = $(".pagination").children().length + 1;
                if (data.pageIndex <= 6) {
                    if(data.pageIndex==6)data.pageIndex = "»"
                    const pageTemplate = Handlebars.compile(
                        document.getElementById("page-template").innerHTML);
                    const commentHtml = pageTemplate(data);
                    $(".pagination").append(commentHtml);
                }
            }
        })
    }
})