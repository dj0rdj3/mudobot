const { Client, MessageEmbed } = require('discord.js');
const config = require("./config.json");
const client = new Client();
let embed = "";
let listening = false;
let returnStr = "";
let channel = null;
let lastID = '';
let lastMSG = '';

client.on('ready', () => {
    console.log('active');
});

client.on('message', message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cntnt = message.content.slice(config.prefix.length).slice(command.length).trim().split(/ +/g);

    if (message.content.indexOf(config.prefix) !== 0) {
        if (listening === true && channel === message.channel) {
            if (message.content.trim().search(/[\s\_-]/g) > -1)
                return message.delete();

            if (returnStr.length >= 2000) {
                embed = new MessageEmbed()
                    .setTitle('Završena priča:')
                    .setColor('#00FF00')
                    .setDescription(returnStr);
                lastMSG.edit(embed)
                lastMSG = '';
                returnStr = "";
                embed = new MessageEmbed()
                message.delete().then(() => {
                    message.channel.send(embed).then(e => {
                        e.edit(embed
                                .setTitle('Započeta nova priča')
                                .setColor('#00FF00'))
                            .then(e => e.delete({ timeout: 1500 }));
                    });
                });
            }

            if (message.author.id !== lastID) {
                returnStr += message.content + " ";
                lastID = message.author.id;
                message.delete();
                embed = new MessageEmbed()
                    .setTitle('Trenutna priča: ')
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                    .setColor('#FF9900')
                    .setDescription(returnStr)
                    .setFooter(`Dužina priče: ${returnStr.length-1}/2000`);

                if (!lastMSG) message.channel.send(embed)
                    .then(e => lastMSG = e);
                else lastMSG.edit(embed);
            } else {
                embed = new MessageEmbed()
                message.delete().then(() => {
                    message.channel.send(embed).then(e => {
                        e.edit(embed
                                .setTitle('Ti si poslednja osoba koja je dodala reč!')
                                .setColor('#FF0000'))
                            .then(e => e.delete({ timeout: 1500 }));
                    });
                });
            }

        } else return;
    }

    if (command === "start" && message.member.roles.cache.has(config.modID) && message.channel.id === config.ows) {
        if (listening === true) {
            embed = new MessageEmbed()
            message.delete().then(() => {
                message.channel.send(embed).then(e => {
                    e.edit(embed
                            .setTitle('Već je pokrenuta priča na ovom kanalu')
                            .setColor('#FF0000'))
                        .then(e => e.delete({ timeout: 1500 }));
                });
            });
        } else {
            listening = true;
            channel = message.channel;
            returnStr = "";
            embed = new MessageEmbed()
            message.delete().then(() => {
                message.channel.send(embed).then(e => {
                    e.edit(embed
                            .setTitle('Započeta nova priča')
                            .setColor('#00FF00'))
                        .then(e => e.delete({ timeout: 1500 }));
                });
            });
        }
    }

    if (command === "stop" && message.member.roles.cache.has(config.modID) && message.channel.id === config.ows) {
        if (!listening) {
            embed = new MessageEmbed()
            message.delete().then(() => {
                message.channel.send(embed).then(e => {
                    e.edit(embed
                            .setTitle('Priča nije bila započeta')
                            .setColor('#FF0000'))
                        .then(e => e.delete({ timeout: 1500 }));
                });
            });
        } else {
            listening = false;
            channel = null;
            lastID = '';

            message.delete();
            embed = new MessageEmbed()
                .setTitle('Završena priča:')
                .setColor('#00FF00')
                .setDescription(returnStr);
            if (lastMSG) lastMSG.edit(embed)
            lastMSG = '';
        }
    }

    if (command === "mstop" && message.member.roles.cache.has(config.modID)) {
        let chan = message.guild.channels.cache.get(config.ows);
        chan.messages.fetch(cntnt[0]).then(msg => {
            let embed = new MessageEmbed();
            msg.edit(embed
                .setTitle("Završena priča:")
                .setDescription(msg.embeds[0].description)
                .setColor('#00FF00'))
        });
    }
});

client.login(config.token);