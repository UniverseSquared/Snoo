var Discord = require("discord.js");
const bot = new Discord.Client();
const token = "MzAyMTUyMTcwNzcyNDk2Mzg0.C9FblA.SxWK4_PpMVRw-Ph0BGVTOlMWvgs";
const osuApiKey = "8c4aa32bda3e546b2ccc3851b2ff4ed64e27369e";
const osu = require("osu")(osuApiKey);
var guild = undefined;
var testSubRole = undefined;
var prefix = "."
//var admins = ["UniverseSquared", "Spelunky1024", "Adolph the Hedgehog", "ValiantVole", "Snoo"]
var questions = [["How many sticks can you craft from one log block?", ["4", "8"], 1], ["How many iron ingots are needed to craft an anvil?", ["30", "31", "32", "64", "10"], 1], ["What used to be the stack limit for blocks?", ["10", "500", "1000", "64", "999"], 4], ["Do you worship the Totem of Snoo?", ["Yes", "No"], 0], ["Which of these was not a considered name for the Nether?", ["The Slip", "The Nexus", "Hell", "The Underworld"], 3], ["How do creepers feel to the touch, according to Notch?", ["Crunchy", "Slimy", "Fuzzy", "Spiky"], 0]];
var polls = [];
var subChannels = [["spam", "sub-spam"], ["sotw", "sub-sotw"], ["testing", "sub-testing"], ["bot_spam", "sub-bot-spam"]];

function isAdmin(member) {
	return member.roles.exists("name", "Snoo Admin");
}

bot.on("ready", () => {
	console.log("Bot ready!");
});

bot.on("guildMemberAdd", (member) => {
	if(!(member.displayName === "[Testing User]")) {
		let channel = member.guild.channels.find("name", "general_chat");
		channel.sendMessage("User " + member.displayName + " joined the server!")
	}
});

bot.on("message", message => {
	if(guild === undefined) {
		guild = message.guild;
	}
	if(testSubRole === undefined && message.guild.name === "Bot Testing") {
		testSubRole = message.guild.roles.get("name", "test-sub") || null;
	}
	let args = message.content.split(" ").slice(1);
	let areArgs = !(args.length == 0);
	if(message.content.startsWith(prefix + "ping")) {
		message.reply("pong!");
	} else if(message.content.startsWith(prefix + "setgame")) {
		bot.user.setGame(args.join(" "));
	} else if(message.content.startsWith(prefix + "purge")) {
		if(isAdmin(message.guild.member(message.author))) {
			let amount = args[0];
			//let silent = args.includes("-s");
			if(!args[0]) {
				message.channel.sendMessage("Invalid usage! " + message.author.toString() + ", `" + prefix + "purge [message]`")
			} else if(amount >= 100) {
				message.reply("you can't do over 100 message! Discord might take me down if you do, they'll think I'm deleting all the message for no reason! ;(");
			} else {
				message.channel.fetchmessage({limit:amount}).then(message => message.channel.bulkDelete(message)).catch(console.error);
			}
		} else {
			message.reply("you don't have permission to do that!");
		}
	} else if(message.content.startsWith(prefix + "quiz")) {
		let index = Math.floor(Math.random() * questions.length);
		let question = questions[args[0] || index];
		if(!args[0]) {
			let m = question[0] + "\n";
			question[1].forEach(function(value, index) {
				m += index + ") " + value + "\n"
			})
			m += "\nRun .quiz " + index + " [Answer Number]";
			message.reply(m);
		} else {
			let m = parseInt(args[1]) == question[2] ? "Correct!" : "Sorry! You got it wrong."
			message.reply(m);
		}
	} else if(message.content.startsWith(prefix + "prefix")) {
		let newPrefix = args[0];
		if(!isAdmin(message.guild.member(message.author))) {
			message.reply("you don't have permission to do that!");
		} else {
			prefix = newPrefix;
			message.channel.sendMessage("Prefix changed to `" + newPrefix + "`");
		}
	} else if(message.content.startsWith(prefix + "kick")) {
		if(!isAdmin(message.guild.member(message.author))) {
			message.reply("you don't have permission to do that!");
		} else {
			if(isAdmin(message.guild.member(message.mentions.users.first()))) {
				message.reply("you can't kick or ban a bot admin!")
			} else {
				message.guild.member(message.mentions.users.first()).kick();
				let channel = message.guild.channels.find("name", "mod-log");
				channel.sendMessage("", {embed:{color:0x6666ff, title:"User kicked", description:"User " + message.mentions.users.first().username + "#" + message.mentions.users.first().discriminator + " kicked by " + message.author.username + "#" + message.author.discriminator + "."}});
			}
		}

	} else if(message.content.startsWith(prefix + "ban")) {
		if(!isAdmin(message.guild.member(message.author))) {
			message.reply("you don't have permission to do that!");
		} else {
			if(isAdmin(message.guild.member(message.mentions.users.first()))) {
				message.reply("you can't kick or ban a bot admin!")
			} else {
				message.guild.member(message.mentions.users.first()).ban();
				let channel = member.guild.channels.find("name", "mod-log");
				channel.sendMessage("", {embed:{color:0x6666ff, title:"User banned", description:"User " + message.mentions.users.first().username + "#" + message.mentions.users.first().discriminator + " banned by " + message.author.username + "#" + message.author.discriminator + "."}});
			}
		}
	} else if(message.content.startsWith(prefix + "help")) {
		message.reply("you can use the following commands.\n```\nping -- used to check if the bot is up, replies with 'pong!'\npurge -- deletes a certain number of message, specified by the user [Admin]\nquiz -- a small quiz game with a few questions\nprefix -- changes the bot prefix [Admin]\nkick -- kicks a user that is mentioned [Admin]\nban -- bans a user that is mentioned\nosu -- get osu stats for a player```\nIf this list is not up-to-date, please tell UniverseSquared#0264 to update it!");
	} else if(message.content.startsWith(prefix + "osu")) {
		let username = args[0];
		osu.get_user({u:username}, function(result) {
			result = result[0];
			let acc = result.accuracy;
			acc = parseFloat(acc).toFixed(2) + "%";
			//message.channel.sendMessage("", {embed:{color:0x8036db, title:username + "'s Stats", description:"PP: " + result.pp_raw + "\nPlay Count: " + result.playcount + "\nAccuracy: " + acc + "\nSS's: " + result.count_rank_ss}});
			message.channel.sendEmbed({
				color: 0x8036db,
				title: username,
				url: "https://osu.ppy.sh/u/" + username,
				fields: [
				{
					name:"Level",
					value:result.level
				},
				{
					name: "PP",
					value: result.pp_raw
				},
				{
					name: "Play Count",
					value: result.playcount
				},
				{
					name:"Accuracy",
					value:acc,
				}
				]
			});
			//message.channel.sendMessage("```" + result.username + "'s stats:\nUser ID: " + result.user_id + "\n300's: " + result.count300 + "\n100's: " + result.count100 + "\n50's: " + result.count50 + "\nTotal Play Count: " + result.playcount + "\nPP: " + result.pp_raw + "\nCountry: " + result.country + "\nSS's: " + result.count_rank_ss +"\nS's: " + result.count_rank_s + "\nA's: " + result.count_rank_a + "\nTotal Accuracy: " + result.accuracy + "```");
		})
	} else if(message.content.startsWith(prefix + "poll")) {
		if(!areArgs) {
			let m = "```Current polls:\n";
			polls.forEach((value) => {
				m += value.name + " | " + value.upvotes.length + ", " + value.downvotes.length + "\n";
			});
			m += "```";
			message.channel.sendMessage(m);
		} else {
			if(args[0] === "upvote") {
				let id = args[1];
				console.log(id);
				console.log(polls[id]);
				let poll = polls[id];
				if(poll.upvotes.includes(message.author)) {
					message.reply("you've already upvoted that poll!");
				} else if(poll.downvotes.includes(message.author)) {
					message.reply("you've downvoted this poll!");
				} else {
					let m = "```" + poll.name + "\nUpvotes: " + poll.upvotes.length + "\nDownvotes: " + poll.downvotes.length + "```\nPoll ID: " + poll.id;
					poll.upvotes.push(message.author);
					polls[id] = poll;
					message.channel.sendMessage(m)
				}
			} else if(args[0] === "downvote") {
				let id = args[1];
				let poll = polls[id];
				if(poll.upvotes.includes(message.author)) {
					message.reply("you've upvoted this poll!");
				} else if(poll.downvotes.includes(message.author)) {
					message.reply("you've already downvoted that poll!");
				} else {
					poll.downvotes.push(message.author);
					polls[id] = poll;
					let m = "```" + poll.name + "\nUpvotes: " + poll.upvotes.length + "\nDownvotes: " + poll.downvotes.length + "```\nPoll ID: " + poll.id;
					message.channel.sendMessage(m);
				}
			} else if(args[0] === "show") {
				let id = args[1];
				let poll = polls[id];
				polls[id] = poll;
				let m = "```" + poll.name + "\nUpvotes: " + poll.upvotes.length + "\nDownvotes: " + poll.downvotes.length + "```\nPoll ID: " + poll.id;
				message.channel.sendMessage(m);
			} else {
				let name = args.join(" ");
				let poll = {name:name, upvotes:[], downvotes:[], id:polls.length};
				poll.upvotes.push(message.author);
				let m = "```" + poll.name + "\nUpvotes: " + poll.upvotes.length + "\nDownvotes: " + poll.downvotes.length + "```\nPoll ID: " + poll.id;
				polls.push(poll);
				message.channel.sendMessage(m)
			}
		}
	} else if(message.content.startsWith(prefix + "sub")) {
		if(message.guild.member(message.author).roles.exists("name", "Strike 2")) {
			message.reply("you've got Strike 2, so you can't do that!");
		} else if(areArgs) {
			if(args[0] === "list") {
				message.reply("you can subscribe to the following channels: #spam, #suggestion_of_the_week");
				//let m = "you can subscribe to the following channels: ";
				//subChannels.forEach(function(value, i) {
				//	m += "#" + value[0];
				//	if(i != subChannels.length - 1) {
				//		m += ", ";
				//	}
				//});
				//message.reply(m);
			} else {
				let a = false;
				let b = 0;
				subChannels.forEach(function(val, i) {
					if(val.includes(args[0])) {
						a = true;
						b = i;
					}
				})
				if(a) {
					let member = guild.member(message.author);
					let role = message.guild.roles.find("name", subChannels[b][1]);
					member.addRole(role);
					message.reply("you subscribed to #" + args[0] + "!");
				}
			}
		}
	} else if(message.content.startsWith(prefix + "unsub")) {
		if(areArgs) {
			let a = false;
			let b = 0;
			subChannels.forEach(function(val, i) {
				if(val.includes(args[0])) {
					a = true;
					b = i;
				}
			})
			if(a) {
				let member = guild.member(message.author);
				let role = message.guild.roles.find("name", subChannels[b][1]);
				member.removeRole(role);
				message.reply("you unsubscribed from #" + args[0] + "!");
			}
		}
	} else if(message.content.startsWith(prefix + "strike")) {
		if(isAdmin(message.guild.member(message.author))) {
			let member = guild.member(message.mentions.users.first());
			let hasStrike1 = member.roles.find("name", "Strike 1");
			let hasStrike2 = member.roles.find("name", "Strike 2");
			if(hasStrike2) {
				member.ban();
				message.channel.sendMessage(member.toString() + " received a third strike and was banned.");
			} else if(hasStrike1) {
				subChannels.forEach(function(value) {
					if(member.roles.exists("name", value[1])) {
						//member.roles.find("name", value[1]);
						member.removeRole(member.roles.find("name", value[1]));
					}
				});
				member.addRole(message.guild.roles.find("name", "Strike 2"));
				message.channel.sendMessage(member.toString() + " received a second strike.");
			} else {
				member.addRole(message.guild.roles.find("name", "Strike 1"));
				message.channel.sendMessage(member.toString() + " received a first strike.");
			}
		} else {
			message.reply("you don't have permission to do that!");
		}
	}
});

bot.login(token);
