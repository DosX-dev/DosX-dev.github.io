if (window.location.hostname !== "") {
    history.pushState(null, null, "/mov");
}

setInterval(() => {
    console.clear();
    console.log("%cWhat are you looking here?", "background-color: red; color: white; font-size: 25px;");
}, 450);

$(window).load(function() {
    "use strict";

    setTimeout(function() {
        $('#preloader').velocity({

            opacity: "0",

            complete: function() {
                $("#loading").velocity("fadeOut", {
                    duration: 1000,
                    easing: [0.7, 0, 0.3, 1],
                });
            }
        })

    }, 1000);

    setTimeout(function() {
        $('.global-overlay').velocity({

                translateX: "50%",
                opacity: "1"

            },

            {
                duration: 1000,
                easing: [0.7, 0, 0.3, 1],
            })

        $(".map-container").addClass("fadeInRight").removeClass('opacity-0');

    }, 1000);

    setTimeout(function() {
        $('#left-side').velocity({

                opacity: "1",

                complete: function() {

                    setTimeout(function() {
                        $('.text-intro').each(function(i) {
                            (function(self) {
                                setTimeout(function() {
                                    $(self).addClass('animated-middle fadeInUp').removeClass('opacity-0');
                                }, (i * 150) + 150);
                            })(this);
                        });
                    }, 0);
                }

            },

            {
                duration: 1000,
                easing: [0.7, 0, 0.3, 1],
            })

    }, 1600);

})

$(document).ready(function() {
    "use strict";

    /* ------------------------------------- */
    /* 2. Action Buttons ................... */
    /* ------------------------------------- */

    $('a#open-more-info').on("click", function() {
        $(".overlay").toggleClass("skew-part");
        $("#right-side").toggleClass("hide-right");
        $("#close-more-info").toggleClass("hide-close");
        $('.mCSB_scrollTools').toggleClass('mCSB_scrollTools-left');
        setTimeout(function() {
            $("#mcs_container").mCustomScrollbar("scrollTo", "#right-side", {
                scrollInertia: 500,
                callbacks: false
            });
        }, 350);
    });

    $('button#close-more-info').on("click", function() {
        $(".overlay").addClass("skew-part");
        $("#right-side").addClass("hide-right");
        $("#close-more-info").addClass("hide-close");
        $('.mCSB_scrollTools').removeClass('mCSB_scrollTools-left');
        setTimeout(function() {
            $("#mcs_container").mCustomScrollbar("scrollTo", "#right-side", {
                scrollInertia: 500,
                callbacks: false
            });
        }, 350);
    });

    // Youtube Variant

    $('.expand-player').on("click", function() {

        $('#left-side').velocity({

            opacity: "0",

            complete: function() {
                $('.global-overlay').velocity({

                        translateX: "-100%",
                        opacity: "0",

                    },

                    {
                        duration: 1000,
                        easing: [0.7, 0, 0.3, 1],
                        delay: 500,
                    })
            }
        })
    });

    $('.compress-player').on("click", function() {

        $('.global-overlay').velocity({

                translateX: "100%",
                opacity: "1",

            },

            {
                duration: 1000,
                easing: [0.7, 0, 0.3, 1],
                delay: 0,

                complete: function() {

                    $('#left-side').velocity({

                        opacity: "1",

                    })

                }
            })
    });

    /* ------------------------------------- */
    /* 3. Scroll plugins ................... */
    /* ------------------------------------- */

    var ifTouchDevices = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/);

    // ScrollBar on Desktop, not on Touch devices for a perfect ergonomy
    function scrollbar() {

        if (ifTouchDevices) {
            $('body').addClass('scroll-touch');

        } else {
            $('body').mCustomScrollbar({
                scrollInertia: 150,
                axis: "y"
            });
        }
    }

    scrollbar();

    var initPhotoSwipeFromDOM = function(gallerySelector) {
        var parseThumbnailElements = function(el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for (var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i];

                if (figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0];

                size = linkEl.getAttribute('data-size').split('x');

                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };



                if (figureEl.children.length > 1) {
                    item.title = figureEl.children[1].innerHTML;
                }

                if (linkEl.children.length > 0) {
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl;
                items.push(item);
            }

            return items;
        };

        var closest = function closest(el, fn) {
            return el && (fn(el) ? el : closest(el.parentNode, fn));
        };

        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if (!clickedListItem) {
                return;
            }

            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if (childNodes[i].nodeType !== 1) {
                    continue;
                }

                if (childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if (index >= 0) {
                openPhotoSwipe(index, clickedGallery);
            }
            return false;
        };

        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
                params = {};

            if (hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if (pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if (params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            options = {

                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                }

            };

            if (fromURL) {
                if (options.galleryPIDs) {
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].pid === index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            if (isNaN(options.index)) {
                return;
            }

            if (disableAnimation) {
                options.showAnimationDuration = 0;
            }

            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        var galleryElements = document.querySelectorAll(gallerySelector);

        for (var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i + 1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        var hashData = photoswipeParseHash();
        if (hashData.pid && hashData.gid) {
            openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
        }
    };

    initPhotoSwipeFromDOM('.my-gallery');

});