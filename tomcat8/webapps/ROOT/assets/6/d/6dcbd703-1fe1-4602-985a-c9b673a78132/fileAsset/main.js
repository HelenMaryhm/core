// User Info Flyoutv
var userInfoDataLoaded = false;

/* Resize Menu */
$(function () { 
    var scroll_timer;
    var smallNav = false;
    var $window = $(window);

    $window.scroll(function () {
        window.clearTimeout(scroll_timer);
        scroll_timer = window.setTimeout(function () { // use a timer for performance
            if($window.scrollTop() <= 50) // make large top of the page
                {
                    smallNav = false;
                    $("#header").removeClass("header-wrap-small");
                }
            else if(smallNav == false) // show if scrolling down
                {
                    smallNav = true;
                    $("#header").addClass("header-wrap-small");
                }
        }, 10);
    });
});


// User Info Flyout
$(function () {
	var x = localStorage.getItem('tabState');
	if(x == "open"){
		$("#userInfo").css("right", "-10px");
		$('#userInfoData').load('/application/ajax/location-clickstream.html');
	}else{
		$("#userInfo").css("right", "-335px");
	};
	
    $("#userInfo .controle .trigger").click(function () {
        if($("#userInfo").css("right") == "-335px"){
            if(!userInfoDataLoaded){
                $('#userInfoData').load('/application/ajax/location-clickstream.html');
                userInfoDataLoaded=true;
            };
            $("#userInfo").animate({right:'-10px'}, {queue: false, duration: 500});
            localStorage.setItem('tabState','open');
        }else{
            $("#userInfo").animate({right:'-335px'}, {queue: false, duration: 500});
            localStorage.setItem('tabState','closed');
        }
    })
});

function activeAddress(text) {
    $('#address-title span').fadeOut('fast', function() {
        $(this).text(text + 'Address');
        $(this).fadeIn();
    });
}

$(document).on('ready', function() {

    var x;
    x = $(window).height() - $(".header-wrap").height() - $(".footer-wrapper").height() - 89;
    $(".content-wrap").css("min-height", x);
    
    // Calling Sticky Sidebar
    $('.sidebar').hcSticky();

    // Calling the Fancybox
    $('.js-fancybox-img').fancybox({
        type: 'image'
    });

    $('.fancybox-swf').fancybox({
        type: 'swf'
    });
    
    $('.js-fancybox-inline').fancybox();

    $('.js-fancybox-media-link').fancybox({
        openEffect  : 'none',
        closeEffect : 'none',
        helpers : {
            media : {}
        }
    });

    $('.js-fancybox-media-file').fancybox();

    // CREATE ACCOUNT PAGE
    // To change the heading text in the address section
    $('.js-address-type .btn').on('click', function() {
        text = $(this).text();
        activeAddress(text);
    });

    // HOME CAROUSEL
    $('#carousel-home').carousel({
        'pause': 'hover'
    });

    // TABLE SORTER
    $('.sorted-tables').tablesorter({
        sortList: [[0,0]]
    });
    
    // Bootstrap Tool Tip
    $('.normaltip').tooltip({
    	'placement': 'bottom'
    });
    $('.risk-system').tooltip({
    	'placement': 'right'
    });
    $('.normaltip-left').tooltip({
    	'placement': 'left'
    });
});

// Video.js
videojs.options.flash.swf = '/_bower_components/video.js/video-js.swf';
