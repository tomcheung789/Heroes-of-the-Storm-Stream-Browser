var twitch = "https://api.twitch.tv/kraken/streams?game=Heroes+of+the+Storm&limit=500",
	streams = [];

function render(filter){
	$('#list').empty();
	var tmp;
	for (var i = 0; i < streams.length; i++) {
		if (filter.length != 0){
			tmp = (streams[i].tooltip+streams[i].name).toLowerCase();
			if (tmp.search(filter.toLowerCase()) == -1) 
				continue;
		}
		
		var row = document.createElement('tr');
		row.className = "pic tooltip";
		row.title = streams[i].tooltip;
		
		var imgbox = document.createElement('td');
		imgbox.className = "td-pic";
		var link = document.createElement('a');
		link.href = streams[i].url;
		var img = document.createElement('div');
		img.style.backgroundImage = "url("+streams[i].image+")";
		link.appendChild(img);
		imgbox.appendChild(link);
		
		var detailbox = document.createElement('td');
		var name = document.createElement('span');
		name.className = "camera";
		var link = document.createElement('a');
		link.href = streams[i].url;
		link.appendChild(document.createTextNode(streams[i].name));
		name.appendChild(link);

		var viewers = document.createElement('span');
		viewers.className = "viewer";
		viewers.appendChild(document.createTextNode(streams[i].viewers));
		detailbox.appendChild(name);
		detailbox.appendChild(document.createElement('br'));
		detailbox.appendChild(viewers);

		var bookmarkbox = document.createElement('td');
		var star = document.createElement('div');
		star.className = "bookmark";
		$(star).data('streamId',streams[i]);
		if(streams[i].bookmarked)
			star.className += ' selected';
		bookmarkbox.appendChild(star);

		
		row.appendChild(imgbox);
		row.appendChild(detailbox);
		row.appendChild(bookmarkbox);
		$('#list').append(row);
	};
	//empty row
	var row = document.createElement('tr');
	row.appendChild(document.createElement('td'));
	row.appendChild(document.createElement('td'));
	row.appendChild(document.createElement('td'));
	$('#list').append(row);
}

function refresh(){
	var store = JSON.parse(localStorage['bookmark']);
	$('#panel').hide();
	$('.loading').show();
	$.getJSON(twitch, function(data){
		streams = [];
		for (var i = 0; i < data.streams.length; i++) {
			var stream = {
				type: 'twitch',
				tooltip: data.streams[i].channel.status,
				image: data.streams[i].preview.small,
				url: data.streams[i].channel.url,
				name: data.streams[i].channel.name,
				viewers: data.streams[i].viewers,
				bookmarked: false
			};

			var searchResult = $.grep(store, function(item) {
				return item.type == stream.type && item.name == stream.name;
			});
			
			if(searchResult.length == 0)
				streams.push(stream);
			else{
				stream.bookmarked = true;
				streams.unshift(stream);
			}
		};
		render('');
		$('a').click(openStream);
		$('.bookmark').click(bookmark);
		$('.loading').hide();
		$('#panel').show();
	});
}

function openStream(){
	chrome.tabs.create({url: $(this).attr('href')});
	return false;
}

function bookmark() {
	var streamId = $(this).data('streamId'),
		store = JSON.parse(localStorage['bookmark']);
	if ($(this).hasClass('selected')) {
		$(this).removeClass('selected');
		store = $.grep(store, function(item) {
			return item.type == streamId.type && item.name != streamId.name;
		});
	}else{
		$(this).addClass('selected');
		store.push(streamId);
	}
	localStorage['bookmark'] = JSON.stringify(store);
}

function prepareStorage(){
	if(!localStorage['bookmark'])
		localStorage['bookmark'] = JSON.stringify([]);
}

$(document).ready(function(){
	prepareStorage();
	refresh(); 
	$('#search').keyup(function(){
		render($(this).val());
	});
	$('#refresh').click(refresh);
})