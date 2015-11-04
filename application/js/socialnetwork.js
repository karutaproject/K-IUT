/* =======================================================
	Copyright 2015 - ePortfolium - Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://opensource.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
   ======================================================= */

var g_elgg_key = "";
var g_elgg_userid = "";
var g_elgg_user_groups = [];

//==================================
function loginElgg(username,password,callback)
//==================================
{
	if (username=='root')
		username = 'karuta_'+username;
	var url = "../../../../"+elgg_url_base+"/services/api/rest/xml/?method=auth.gettoken&username="+username+"&password="+password;
	$.ajax({
		Accept: "json",
		dataType : "json",
		type : "POST",
		url : url,
		success : function(data) {
			var g_elgg_key = data.result;
			if (callback!=null)
				callback(g_elgg_key);
		}
	});
}

//==================================
function getElggUser()
//==================================
{
	var url = "../../../../"+elgg_url_base+"/services/api/rest/xml/?method=auth.getuser";
	$.ajax({
		Accept: "json",
		dataType : "json",
		type : "GET",
		url : url,
		success : function(data) {
			g_elgg_userid = data.result.guid;
		}
	});
}

//==============================
function getProjectNetworkMenu(projectcode)
//==============================
{
	var html = "";
	var group_exists = false;
	var group_id = "";
	var owner_id = "";
	for (var i=0; i<g_elgg_user_groups.length; i++) {
		if (projectcode==g_elgg_user_groups[i].name) {
			group_id = g_elgg_user_groups[i].guid;
			owner_id = g_elgg_user_groups[i].owner_guid;
		}
	}
	if (owner_id==g_elgg_userid)
		html += "<li><a onclick=\"callAddGroupMembers('"+group_id+"')\" href='#'>"+snStr[LANG]['add_member']+"</a></li>";		
	if (html!="")
		html = 	"<hr>" + html;
	return html;
}

//==============================
function replyBox(objectid,tabid)
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Reply box ==================== -->";
	html += "\n<div id='replay-box'>";
	html += "	<textarea class='form-control' rows='2' id='reply-message'></textarea>";
	html += "	<span onclick=\"postComment('"+objectid+"');\" class='reply-button'>"+snStr[LANG]["comment"]+"</span>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	$("#"+tabid+"-reply-"+objectid).html($(html));
}

//=================================================
function toggleReplyBox(objectid,tabid)
//=================================================
{
	replyBox(objectid,tabid);
	if($("#"+tabid+"-reply-"+objectid).is(":visible"))
		$("#"+tabid+"-reply-"+objectid).hide();
	else
		$("#"+tabid+"-reply-"+objectid).show();
}


//==================================
function displaySocialNetwork(destid)
//==================================
{
	getElggUser();
	$.ajaxSetup({async: false});
	setUserGroups($(USER.username_node).text());
	$.ajaxSetup({async: true});
	var html = "";
	html += "		<div class='form-group'>";
	html += "			<div class='wire-label'><em class='fa fa-comment-o'></em> Quelque chose &agrave; publier sur le r&eacute;seau social interne ?</div>";
	html += "			<textarea class='form-control' rows='2' id='wire-message'></textarea>";
	html += "			<table><tr>";
	html += "				<td class='publish-button'>";
	html += "					<span onclick=\"postWire('"+destid+"-body');\" class='action-button'>Publier</span>";
	html += "				</td>";
	html += "				<td class='publish_on'>&nbsp;sur&nbsp;</td> ";
	html += "				<td class='group-button'>";
	html += "					<span class='dropdown dropdown-button'>";
	html += "						<span class='button' data-toggle='dropdown' type='button' aria-haspopup='true' aria-expanded='false'><span id='publish-group' value='0'>Public</span>&nbsp;<span class='caret'></span></span>";
	html += "						<ul id='select-group' class='dropdown-menu' role='menu' aria-labelledby='list-menu'>";
	html += "						</ul>";
	html += "					</span>";
	html += "				</td>";
	html += "			</tr></table>";
	html += "		</div>";
	$("#"+destid+"-head").append($(html));

	html = "<div class='panels'>";

	html += "	<ul class='nav nav-tabs' role='tablist'>";
	html += "		<li role='presentation' class='active'><a href='#activities' aria-controls='activities' role='tab' data-toggle='tab'>Activités du réseau</a></li>";
	html += "		<li role='presentation'><a href='#public' aria-controls='public' role='tab' data-toggle='tab'>Tous les murs</a></li>";
	html += "		<li role='presentation'><a href='#groups' aria-controls='groups' role='tab' data-toggle='tab'>Les murs de mes groupes</a></li>";
	html += "	</ul>";

	  <!-- Tab panes -->
	html += "	<div class='tab-content'>";
	html += "		<div role='tabpanel' class='tab-pane active' id='activities'></div>";
	html += "		<div role='tabpanel' class='tab-pane' id='public'>...</div>";
	html += "		<div role='tabpanel' class='tab-pane' id='groups'>...</div>";
	html += "	</div>";

	html += "</div>";
	display_select_group("select-group");
	$("#"+destid+"-body").append($(html));
	//------------------------------
	getRiverFeed('activities');
	getWall('public');
	displayGroupWalls('groups');
}


//=================================================
function getComments(node)
//=================================================
{
	var date = moment(node.time_updated);
	var html ="";
	html+= "<li class='elgg-item elgg-item-object elgg-item-object-comment'>";
	html+= "<div class='media elgg-body'>";
	html+= "	<div class='media-left'>";
	html+= "		<div class='elgg-avatar elgg-avatar-tiny'>";
	html+= "			<img src='"+node.owner.avatar_url+"'>";
	html+= "		</div>";
	html+= "	</div>";
	html+= "	<div class='media-body'>";
	html+= "		<h5 class='media-heading'>";
	html+= "					<span class='glyphicon glyphicon-remove' onclick=\"deleteWire('"+node.guid+"')\"></span> ";
	if (node.num_likes!='0')
		html += "				<span class='likes'>"+node.num_likes+"</span>";
	html+= "					<span class='glyphicon glyphicon-thumbs-up' onclick=\"likeEntity('"+node.guid+"')\"></span> ";
	html+= "			"+node.owner.name+" ";
	html+= " 			<span class='elgg-river-timestamp'><acronym title='"+date.format('LLL')+"'>"+date.fromNow()+"</acronym></span>";
	html+= "		</h5>";
	html+= "		<div class='elgg-output elgg-inner'>"+node.description+"</div>";
	html+= "	</div>";
	html+= "</div>";
	html+= "</li>";
	return html;
}

//=================================================
function likeEntity(objectid)
//=================================================
{
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml",
		data: "auth_token="+g_elgg_key+"&method=wire.save_like&entity_guid="+objectid,
		success : function(data) {
			getRiverFeed('activities');
			getWall('public');
			displayGroupWalls('groups');
		}
	});
}

//=================================================
function toggleComments(id)
//=================================================
{
	if ($("#plus-"+id).hasClass("glyphicon-plus")) {
		$("#plus-"+id).removeClass("glyphicon-plus")
		$("#plus-"+id).addClass("glyphicon-minus")
		$("#comments-"+id).show();
	} else {
		$("#plus-"+id).removeClass("glyphicon-minus")
		$("#plus-"+id).addClass("glyphicon-plus")
		$("#comments-"+id).hide();
	}

}



//=================================================================================================
//=================================================================================================
//=====================================  ACTIVITIES  ==============================================
//=================================================================================================
//=================================================================================================

//==================================
function getRiverFeed(destid)
//==================================
{
	$.ajax({
		Accept: "json",
		dataType : "json",
		type : "GET",
		url : "../../../"+elgg_url_base+"services/api/rest/xml/?auth_token="+g_elgg_key+"&method=site.river_feed&limit=50",
		success : function(data) {
			displayRiver("#"+destid,data);
		}
	});
	
}

//=================================================
function displayRiver(dest,data)
//=================================================
{
	$(dest).html("");
	for (var i=0;i<data.result.length;i++){
		var view = data.result[i].view.replace(/\//g,"_");
		try {
			eval(view+"('"+dest+"',data.result[i])");
		} catch(e) {
			eval("river_unknown('"+dest+"',data.result[i])");
		}
	}
}

//=================================================
function river_item(dest,node,action)
//=================================================
{
	var date = moment(node.object.time_updated);
	var html ="";
	html+= "<li class='elgg-item'>";
	html+= "<div class='elgg-image-block elgg-river-item clearfix'>";
	html+= "	<div class='elgg-image'>";
	html+= "		<div class='elgg-avatar elgg-avatar-small'>";
	html+= "			<img src='"+node.subject.avatar_url+"'>";
	html+= "		</div>";
	html+= "	</div>";
	html+= "	<div class='elgg-body'>";
	html+= "		<div class='media'>";
	html+= "			<div class='media-left'>";
	html+= "			</div>";
	html+= "			<div class='media-body'>";
	html+= "				<h5 class='media-heading'>";
	//----------------------------------
	if (node.object.owner_guid==g_elgg_userid) // test if owner
		html+= "					<i class='fa fa-times fa-lg' onclick=\"deleteWire('"+node.object_guid+"')\"></i> ";
	if (node.num_likes!='0')
		html += "				<span class='likes'>&nbsp;"+node.num_likes+"</span>";
	html+= "					<i class='fa fa-thumbs-o-up fa-lg' onclick=\"likeEntity('"+node.object_guid+"')\"></i> ";
	html+= "					<i id='plus-"+node.id+"' onclick=\"toggleComments('"+node.id+"')\" class='fa fa-plus fa-lg' style='display:none'></i> ";
	html+= "					<span class='repondre' onclick=\"toggleReplyBox('"+node.object_guid+"','river')\">Répondre</span> ";
	//----------------------------------
	html+= "					<span class='elgg-river-subject'>"+node.subject.name+"</span> ";
	html+= 						snStr[LANG][action];
	html+= " 					<span id='object-"+node.id+"'></span>";
	html+= " 					<span class='elgg-river-timestamp'><acronym title='"+date.format('LLL')+"'>"+date.fromNow()+"</acronym></span>";
	html+= "				</h5>";
	html+= " 				<div id='content-"+node.id+"'></div>";
	if (node.object.comments!=undefined) {
		$("#"+node.id+"-plus").show();
		html+= "<div id='comments-"+node.id+"' class='elgg-river-comments' style='display:none'>";
		html+= "<ul class='elgg-list elgg-river-comments'>";
		for (var i=0;i<node.object.comments.length;i++) {
			html += getComments(node.object.comments[i]);
		}
		html+= "</ul>";
		html+= "</div>";
	}
	html+= "				<div id='river-reply-"+node.object_guid+"' style='display:none'></div>";
	html+= "			</div><!-- class='media-body' -->";
	html+= "		</div><!-- class='media' -->";
	html+= "	</div><!-- class='elgg-body' -->";
	html+= "</div><!-- class='elgg-image-block elgg-river-item clearfix' -->";
	html+= "</li>";
	$(dest).append($(html));
	if (node.object.comments!=undefined)
		$("#plus-"+node.id).show();
}

	
//=================================================
function river_unknown(dest,node)
//=================================================
{
	var html ="";
	html+= "<div class='post river_unknown'>";
	html +="<img src='"+node.subject.avatar_url+"'> ";
	html +="<span>"+node.subject.name+" </span>";
	html +="<span> unknown action </span>";
	html+= "</div><!--post-->";
	$(dest).append($(html));

}


//=================================================
function river_user_default_profileiconupdate(dest,node)
//=================================================
{
	river_item(dest,node,'river_user_default_profileiconupdate');
	var html= "";
	html+= "				<div class='elgg-river-attachments clearfix'>";
	html+= "					<div class='elgg-avatar elgg-avatar-tiny'>";
	html+= "						<img src='"+node.subject.avatar_url+"'>";
	html+= "					</div>";
	html+= "				</div>";
	$("#content-"+node.id).html($(html));
}

//=================================================
function river_relationship_friend_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_relationship_friend_create');
}

//=================================================
function river_object_blog_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_object_blog_create');
}

//=================================================
function river_object_thewire_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_object_thewire_create');
	var html= "<div>"+node.object.description+"</div>";
	$("#content-"+node.id).html($(html))
}

//=================================================
function river_relationship_member_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_relationship_member_create');
	var html= " "+node.object.name;
	$("#object-"+node.id).html(html)
}

//=================================================
function river_group_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_group_create');
	var html= " "+node.object.name;
	$("#object-"+node.id).html(html)
}

//=================================================
function river_object_status_create(dest,node)
//=================================================
{
	river_item(dest,node,'river_object_status_create');
	var html= "<div>"+node.object.description+"</div>";
	$("#content-"+node.id).html($(html))
}


//=================================================================================================
//=================================================================================================
//==========================================  THE WIRE  ===========================================
//=================================================================================================
//=================================================================================================

//==================================
function postWire()
//==================================
{
	var groupid = $('#publish-group').attr('value');
	var message = document.getElementById("wire-message").value;
	var url = "../../../"+elgg_url_base+"services/api/rest/xml/?auth_token="+g_elgg_key+"&text="+message;
	if (groupid==0)
		url += "&method=thewire.post";
	else
		url += "&method=group.wire.post&group_guid="+groupid;
	$.ajax({
		type : "POST",
		dataType : "json",
		url : url,
		data: message,
		success : function(data) {
			document.getElementById("wire-message").value = '';
			getRiverFeed('activities');
			getWall('public');
			displayGroupWalls('groups');
		}
	});
}

//==================================
function postComment(objectid)
//==================================
{
	var message = document.getElementById("reply-message").value;
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml/?auth_token="+g_elgg_key+"&entity_guid="+objectid+"&method=wire.save_comment&text="+message,
		data: message,
		success : function(data) {
			document.getElementById("reply-message").value = '';
			getRiverFeed('activities');
			getWall('public');
			displayGroupWalls('groups');
		}
	});
}

//==================================
function deleteWire(objectid)
//==================================
{
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml",
		data : "auth_token="+g_elgg_key+"&method=wire.delete_post&entity_guid="+objectid,
		success : function(data) {
			getRiverFeed('activities');
			getWall('public');
			displayGroupWalls('groups');
		}
	});
}

//==================================
function getWall(destid,groupid,tabid)
//==================================
{
	var url = "../../../"+elgg_url_base+"services/api/rest/xml/?method=group.thewire.get_posts&auth_token="+g_elgg_key+"&limit=50";
	if (groupid!=null)
		url += "&container_guid="+groupid;
	if (tabid==null)
		tabid = 'public';
	$.ajax({
		Accept: "text/html",
		dataType : "json",
		type : "GET",
		url : url,
		success : function(data) {
				displayWall("#"+destid,data,tabid);
		}
	});
}

//=================================================
function displayGroupWalls(destid)
//=================================================
{
	$("#"+destid).html("");
	for (var i=0; i<g_elgg_user_groups.length; i++) {
		var html = "<div class='group-label'>"+g_elgg_user_groups[i].name+"</div>";
		html += "<div id='group-"+i+"' class='group-posts'></div>";
		$("#"+destid).append($(html));
		getWall('group-'+i,g_elgg_user_groups[i].guid,'groups');
	}
}



//=================================================
function displayWall(dest,data,tabid)
//=================================================
{
	if (data.status==-1)
		$(dest).html("<div class='empty-wall'>"+snStr[LANG]['empty-wall']+"</div>");
	else {
		$(dest).html("");
		for (var i=0;i<data.result.length;i++) {
			display_post(dest,data.result[i],tabid);
		}
	}
}

//=================================================
function display_post(dest,node,tabid)
//=================================================
{
	var date = moment(node.time_created);
	var html ="";
	html+= "<li class='elgg-item'>";
	html+= "<div class='elgg-image-block elgg-river-item clearfix'>";
	html+= "	<div class='elgg-image'>";
	html+= "		<div class='elgg-avatar elgg-avatar-small'>";
	html+= "			<img src='"+node.owner.avatar_url+"'>";
	html+= "		</div>";
	html+= "	</div>";
	html+= "	<div class='elgg-body'>";
	html+= "		<div class='media'>";
	html+= "			<div class='media-left'>";
	html+= "			</div>";
	html+= "			<div class='media-body'>";
	html+= "				<h5 class='media-heading'>";
	//----------------------------------
	if (node.owner.guid==g_elgg_userid) // test if owner
		html+= "					<i class='fa fa-times fa-lg' onclick=\"deleteWire('"+node.guid+"')\"></i> ";
	if (node.num_likes!='0')
		html += "				<span class='likes'>&nbsp;"+node.num_likes+"</span>";
	html+= "					<i class='fa fa-thumbs-o-up fa-lg' onclick=\"likeEntity('"+node.guid+"')\"></i> ";
	html+= "					<span id='plus-"+tabid+node.guid+"' onclick=\"toggleComments('"+tabid+node.guid+"')\" class='fa fa-plus fa-lg' style='display:none'></span> ";
	html+= "					<span class='repondre' onclick=\"toggleReplyBox('"+node.object_guid+"','river')\">Répondre</span> ";
	//----------------------------------
	html+= "					<span class='elgg-river-subject'>"+node.owner.name+"</span> ";
	html+= 						snStr[LANG]['river_object_status_create'];
	html+= " 					<span class='elgg-river-timestamp'><acronym title='"+date.format('LLL')+"'>"+date.fromNow()+"</acronym></span>";
	html+= "				</h5>";
	html+= " 					<div>"+node.description+"</div>";
	if (node.object!=undefined && node.object.comments!=undefined) {
		html+= "<div id='comments-"+tabid+node.guid+"' class='elgg-river-comments' style='display:none'>";
		html+= "<ul class='elgg-list elgg-river-comments'>";
		for (var i=0;i<node.object.comments.length;i++) {
			html += getComments(node.object.comments[i]);
		}
		html+= "</ul>";
		html+= "</div>";
	}
	html+= "				<div id='"+tabid+"-reply-"+node.guid+"' style='display:none'></div>";
	html+= "			</div><!-- class='media-body' -->";
	html+= "		</div><!-- class='media' -->";
	html+= "	</div><!-- class='elgg-body' -->";
	html+= "</div><!-- class='elgg-image-block elgg-river-item clearfix' -->";
	html+= "</li>";
	$(dest).append($(html));
	//------------ if there are comments we show them
	if (node.object!=undefined && node.object.comments!=undefined)
		$("#plus-"+tabid+node.guid).show();
}

//=================================================================================================
//=================================================================================================
//==================================  USER & GROUP  ===============================================
//=================================================================================================
//=================================================================================================

//=================================================
function user_register(name, email, username, password,callback,param1)
//=================================================
{
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml",
		data: "auth_token="+g_elgg_key+"&method=user.register&name="+name+"&username="+username+"&password="+password+"&email="+email,
		success : function(data) {
			if (callback!=null)
				callback(param1);
		}
	});
}

//=================================================
function createNetworkGroup(name,callback,param1)
//=================================================
{
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml",
		data: "auth_token="+g_elgg_key+"&method=group.save&name="+name,
		success : function(data) {
			if (callback!=null)
				callback(param1);
		}
	});
}

//=================================================
function deleteNetworkGroup(name,callback,param1)
//=================================================
{
	var groupid = "";
	for (var i=0; i<g_elgg_user_groups.length; i++) {
		if (g_elgg_user_groups[i].name==name)
			groupid = g_elgg_user_groups[i].guid;
	}
	if (groupid!="")
		$.ajax({
			type : "POST",
			dataType : "json",
			url : "../../../"+elgg_url_base+"services/api/rest/xml",
			data: "auth_token="+g_elgg_key+"&method=group.delete&group_guid="+groupid,
			success : function(data) {
				if (callback!=null)
					callback(param1);
			}
		});
}

//=================================================
function display_select_group(destid)
//=================================================
{
	var html = "";
	html += "<li><a value='0' label='Public' onclick=\"$('#publish-group').html('Public');$('#publish-group').attr('value','0');\" href='#'>Public</a></li>";
	for (var i=0; i<g_elgg_user_groups.length; i++) {
		html += "<li><a value='1' label='"+g_elgg_user_groups[i].name+"' onclick=\"$('#publish-group').html('"+g_elgg_user_groups[i].name+"');$('#publish-group').attr('value','"+g_elgg_user_groups[i].guid+"');\" href='#'>"+g_elgg_user_groups[i].name+"</a></li>";
	}
	$("#"+destid).html($(html))
}

//==================================
function setUserGroups(username,callback,param1)
//==================================
{
	if (username=='root')
		username = 'karuta_'+username;
	$.ajax({
		Accept: "json",
		dataType : "json",
		type : "GET",
		url : "../../../../"+elgg_url_base+"/services/api/rest/xml/?auth_token="+g_elgg_key+"&method=group.get_groups",
		success : function(data) {
			if (data.status!=-1)
				g_elgg_user_groups = data.result;
		}
	});
}

//=================================================
function addGroupMember(groupid,username,callback,param1)
//=================================================
{
	if (username=='root')
		username = 'karuta_'+username;
	$.ajax({
		type : "POST",
		dataType : "json",
		url : "../../../"+elgg_url_base+"services/api/rest/xml",
		data: "auth_token="+g_elgg_key+"&method=group.join&group_guid="+groupid+"&username="+username,
		success : function(data) {
			if (callback!=null)
				callback(data,param1);
		}
	});
}

//=================================================
function addGroupMembers(groupid)
//=================================================
{
	var users = $("input[name='select_users']").filter(':checked');
	for (var i=0; i<users.length; i++){
		var username = $(users[i]).attr('username');
		addGroupMember(groupid,username);
	}
};

//=================================================
function callAddGroupMembers(groupid)
//=================================================
{
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var js2 = "addGroupMembers('"+groupid+"')";
	var footer = "<button class='btn' onclick=\""+js2+";\">"+snStr[LANG]['add_member']+"</button><button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").html(footer);
	$("#edit-window-title").html(snStr[LANG]['add_member']);
	var html = "";
	html += "<div class='row'>";
	html += "<div class='col-md-3'><br>";
	html += karutaStr[LANG]['select_users'];
	html += "</div>";
	html += "<div class='col-md-9'>";
	html += "<div id='sharing_users'></div>";
	html += "</div>";
	html += "</div><!--row-->";
	html += "</div><!--sharing-->";
	$("#edit-window-body").html(html);
	$("#edit-window-body-node").html("");
	$("#edit-window-body-metadata").html("");
	$("#edit-window-body-metadata-epm").html("");
	//-------------------------------------
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/users",
		success : function(data) {
			UIFactory["User"].parse(data);
			UIFactory["User"].displaySelectMultipleActive('sharing_users');
		},
		error : function(jqxhr,textStatus) {
			alert("Error in callShare 1 : "+jqxhr.responseText);
		}
	});
	//--------------------------
	$('#edit-window').modal('show');
}



