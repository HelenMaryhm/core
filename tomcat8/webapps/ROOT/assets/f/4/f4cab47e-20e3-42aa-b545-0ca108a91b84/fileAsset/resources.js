var dotcmsServer = '';
var baseUrl = window.location.origin + '/api/content/type/json/render/false/query/+structureName:Document%20+(conhost:48190c8c-42c4-46af-8d1a-0cd5db894797%20conhost:SYSTEM_HOST)%20+languageId:1%20+deleted:false%20+working:true%20';

var extQuery = '';
var limit = 5;
var requestUrl;
var searchQuery = '';
var tags = [];
var tagsQuery = '';
var topics = [];
var topicsQuery = '';

function loadingAnimation(state, fromButton) {
  var loadingIcon = '/application/themes/quest/images/layout/ico_loading.gif';
  if (!state) {
    $('.js-loading').remove();
  } else {
    if (fromButton) {
      $('.js-show-more').html('<img src="' + loadingIcon + '" width="16" height="16"> Loading...');
    } else {
      if (!$('.js-loading').length) {
        $('.js-document-list').before('<div class="alert alert-default loading-info js-loading"><h4><img src="' + loadingIcon + '"> Loading...</h4></div>');
      }
    }
  }
}

function updateResults() {
  var searchContent = '';
  var topicsContent = '';
  var tagsContent = '';
  if (topics.length) {
    topicsTemplate = '<span class="search-label">Filter by:</span> <% _.each(content, function(name) { %><span class="search-term"><%= name %></span>, <% }); %>';
    topicsContent = _.template(topicsTemplate, {content: topics}).replace(/,\s*$/, '');
  }
  if (tags.length) {
    tagsTemplate = '<span class="search-label">Tagged by:</span> <% _.each(content, function(name) { %><span class="search-term"><%= name %></span>, <% }); %>';
    tagsContent = _.template(tagsTemplate, {content: tags}).replace(/,\s*$/, '');
  }

  var textValue = $('.js-search-text').val() || '';
  if (textValue) {
      searchContent = _.template('<span class="search-label">Search Results for:</span> <span class="search-term"><%= value %></span>', {value: textValue});
  }
  $('.js-search-string').html(searchContent + topicsContent + tagsContent);
}

function renderResults(results) {
  loadingAnimation(false);
  if (results.contentlets.length) {
    var mediaTemplate = $('#media-item-template').html();
    var content = _.template(mediaTemplate, {data: results.contentlets});
    if ($('.js-document-list li').length === 0) {
      $('.js-document-list').html(content);
    } else {
      $('.js-document-list li:last-child').after(content);
    }
    if (results.contentlets.length < limit) {
      $('.js-show-more').addClass('disabled').text('No more content for load...');
    } else {
      $('.js-show-more').show();
      $('.js-show-more').removeClass('disabled').text('Show More Results');
    }
  } else if ($('.js-document-list li').length > 0) {
    $('.js-show-more').addClass('disabled').text('No more content for load...');
  } else {
    $('.js-document-list').html('<li class="js-not-found"><div class="jumbotron js-not-found"><h1>Ooops, nothing found</h1><p>There is no resources availables for this query, what about if you...</p><p><a class="btn btn-primary btn-lg" role="button" onClick="resetFilters()">Start Over</a></p></div></li>');
  }
  updateResults();
}

function getDocumentItems(page, fromButton) {
  var offset;
  if (!fromButton) {
    $('.js-show-more').hide();
  }
  loadingAnimation(true, fromButton);
  if (!page) {
    offset = 0;
  } else {
    offset = page * limit;
  }
  requestUrl = baseUrl + topicsQuery + tagsQuery + searchQuery + extQuery +'/orderby/modDate%20desc' + '/limit/' + limit + '/offset/' + offset + '/';
  console.log('Requesting data from url: ' + requestUrl);
  $.ajax({
    type: 'GET',
    url: requestUrl,
    success: function(data) {
      renderResults(data);
    }
  });
}

function resetFilters() {
  $('.js-filter-items a').removeClass('active');
  $('.js-not-found').remove();
  $('.js-search-text').val('');
  searchQuery = '';
  tags = [];
  tagsQuery = '';
  topics = [];
  topicsQuery = '';
  getDocumentItems();
}

function filterItems() {
  var index;
  $('.js-filter-items a').on('click', function(e) {
    $('.js-document-list').empty();
    e.preventDefault();

    if (e.currentTarget.dataset.topic) {
      if ($(this).hasClass('active')) {
        index = topics.indexOf(e.currentTarget.dataset.topic);
        if (index > -1) {
          topics.splice(index, 1);
        }
        $(this).removeClass('active');
      } else {
        topics.push(e.currentTarget.dataset.topic);
        $(this).addClass('active');
      }
      topicsQuery = '';
      _.each(topics, function(t) {
        topicsQuery = topicsQuery + 'categories:' + t + '%20';
      });
      if (topics.length) {
        topicsQuery = '+(' + topicsQuery + ')';
        topicsQuery = topicsQuery.replace('%20)', ')');
      }
    }

    if (e.currentTarget.dataset.tag) {
      if ($(this).hasClass('active')) {
        index = tags.indexOf(e.currentTarget.dataset.tag);
        if (index > -1) {
          tags.splice(index, 1);
        }
        $(this).removeClass('active');
      } else {
        tags.push(e.currentTarget.dataset.tag);
        $(this).addClass('active');
      }
      tagsQuery = '';
      _.each(tags, function(t) {
        tagsQuery = tagsQuery + '+Document.tags:*' + t + '*%20';
      });
    }

    getDocumentItems();
  });

  $('.js-doc-search').on('submit', function(e) {
    $('.js-document-list').empty();
    e.preventDefault();
    var textValue = $('.js-search-text').val();
    var extValue = $('input[name=options]:checked', '.js-doc-search').attr('id');
    if (textValue.length) {
      searchQuery = '+_all:' + textValue + '*';
    } else {
      searchQuery = '';
    }

    switch (extValue) {
      case 'all':
        extQuery = '';
        break;
      case 'image':
        extQuery = '+Document.metaData:image/*%20';
        break;
      case 'video':
        extQuery = '+Document.metaData:video/*%20';
        break;
      case 'document':
        extQuery = '+Document.metaData:application/*%20';
        break;
    }

    getDocumentItems();
  });
}

function loadMoreContent() {
  $('.js-show-more').on('click', function() {
    var page = parseInt($('.js-show-more').data('page'), 10);
    $('.js-show-more').data('page', page + 1);
    getDocumentItems(page, true);
  });
}

function setDate(date, timestamp) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'];
  var monthsNumber = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  date = new Date(date);

  if (!timestamp) {
    return months[date.getMonth()] + ' ' + date.getDate() + ',' + ' ' + date.getFullYear();
  } else {
    return date.getFullYear() + '-' + monthsNumber[date.getMonth()] + '-' + date.getDate();
  }

}

function checkFileType(type, inode) {
  if (type.indexOf('image/') === 0) {
    return '<img src="' + dotcmsServer + '/contentAsset/image/' + inode + '/fileAsset/byInode/1/filter/Resize/resize_w/120" alt="<%= doc.title %>"/>';
  } else if (type.indexOf('application/pdf') === 0) {
    return '<div class="doc-thumbnail pdf"></div>';
  } else if (type.indexOf('video/') === 0 || type.indexOf('application/ogg') === 0) {
    return '<div class="doc-thumbnail video"></div>';
  } else if (type.indexOf('application/msword') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.wordprocessingml.document') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.wordprocessingml.template') === 0 || type.indexOf('application/vnd.ms-word.document.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-word.template.macroEnabled.12') === 0) {
    return '<div class="doc-thumbnail word"></div>';
  } else if(type.indexOf('application/vnd.ms-excel') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.template') === 0 || type.indexOf('application/vnd.ms-excel.sheet.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-excel.template.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-excel.addin.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-excel.sheet.binary.macroEnabled.12') === 0) {
    return '<div class="doc-thumbnail excel"></div>';
  } else if(type.indexOf('application/vnd.ms-powerpoint') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.presentationml.presentation') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.presentationml.template') === 0 || type.indexOf('application/vnd.openxmlformats-officedocument.presentationml.slideshow') === 0 || type.indexOf('application/vnd.ms-powerpoint.addin.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-powerpoint.presentation.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-powerpoint.template.macroEnabled.12') === 0 || type.indexOf('application/vnd.ms-powerpoint.slideshow.macroEnabled.12') === 0) {
    return '<div class="doc-thumbnail powerpoint"></div>';
  } else {
    return '<div class="doc-thumbnail unknow"></div>';
  }
}

$(document).on('ready', function() {
  getDocumentItems();
  loadMoreContent();
  filterItems();
});
