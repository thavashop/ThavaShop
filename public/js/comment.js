$('#comment-form button').on('click', function (e) {
    e.preventDefault();
    $.post('/category/post-comment', {
        content: $("#comment-content").val(),
        productId: $("#product-id").val(),
        name: $("#name").val(),
    }, function (data) {
        const commentTemplate = Handlebars.compile(
            document.getElementById("comment-template").innerHTML);
        const commentHtml = commentTemplate(data);
        $("#comment-list").prepend(commentHtml);
    })
})