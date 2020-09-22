const { Client, MessageEmbed } = require('discord.js');
const redis = require("redis");
const bluebird = require("bluebird");
const fs = require("fs");
const config = require("./config.json");
const client = new Client();
bluebird.promisifyAll(redis.RedisClient.prototype);
const db = redis.createClient({
    port: config.dbport,
    host: config.dbhost
});
let stat = "Разматра се";

client.on('ready', () => {
    console.log('active');
});

client.on('message', message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cntnt = message.content.slice(config.prefix.length).slice(command.length).trim().split(/ +/g);

    if (message.channel.id === config.suggestions) {
        const c = message.content;
        if (c.includes(".jpg") || c.includes(".png") || c.includes(".jpeg") || c.includes(".gif")) {
            embed = new MessageEmbed();
            message.delete().then(() => {
                message.channel.send(embed).then(e => {
                    fs.readFile('./next_n.json', 'utf8', function(err, fl) {
                        if (err) console.log(err);
                        else {
                            let next_n = JSON.parse(fl);
                            db.hset('suggestions', next_n.next_n, e.id);
                            e.edit(embed
                                .setTitle(`Емоџи сугестија #${next_n.next_n} од ${message.member.displayName}`)
                                .setThumbnail(message.author.displayAvatarURL())
                                .setColor('#00FF00')
                                .setImage(message.content)
                                .addField("Статус", stat));
                            e.react('👍').then(() => { e.react('👎') });
                            next_n.next_n++;
                            let json = JSON.stringify(next_n);
                            fs.writeFile('./next_n.json', json, 'utf8', function(err) {
                                if (err) console.log(err);
                            });
                        }
                    });
                });
            });
        } else {
            embed = new MessageEmbed();
            message.delete().then(() => {
                message.channel.send(embed).then(e => {
                    fs.readFile('./next_n.json', 'utf8', function(err, fl) {
                        if (err) console.log(err);
                        else {
                            let next_n = JSON.parse(fl);
                            db.hset('suggestions', next_n.next_n, e.id);
                            e.edit(embed
                                .setTitle(`Сугестија #${next_n.next_n} од ${message.member.displayName}`)
                                .setThumbnail(message.author.displayAvatarURL())
                                .setColor('#00FF00')
                                .setDescription(message.content)
                                .addField("Статус", stat));
                            e.react('👍').then(() => { e.react('👎') });
                            next_n.next_n++;
                            let json = JSON.stringify(next_n);
                            fs.writeFile('./next_n.json', json, 'utf8', function(err) {
                                if (err) console.log(err);
                            });
                        }
                    });
                });
            });
        }
    }

    if (command === "sugestija" && message.member.roles.cache.has(config.modID)) {
        let chan = message.guild.channels.cache.get(config.suggestions);
        let brs = cntnt[0];
        let newstat = cntnt.slice(1).toString().replace(/,/g, " ");
        db.hmget('suggestions', brs, function(err, dat) {
            chan.messages.fetch(dat[0]).then(msg => {
                if (msg.embeds[0].title.includes("Емоџи")) {
                    let embed = new MessageEmbed();
                    msg.edit(embed
                        .setTitle(msg.embeds[0].title)
                        .setImage(msg.embeds[0].image.url)
                        .setThumbnail(msg.embeds[0].thumbnail.url)
                        .setColor('#00FF00')
                        .addField('Статус', newstat)
                    )
                } else {
                    let embed = new MessageEmbed();
                    msg.edit(embed
                        .setTitle(msg.embeds[0].title)
                        .setDescription(msg.embeds[0].description)
                        .setThumbnail(msg.embeds[0].thumbnail.url)
                        .setColor('#00FF00')
                        .addField('Статус', newstat)
                    )
                }
            });
        });
    }

    if (command === "obrisisugestiju" && message.member.roles.cache.has(config.modID)) {
        let chan = message.guild.channels.cache.get(config.suggestions);
        let brs = cntnt[0];
        let newstat = cntnt.slice(1).toString().replace(/,/g, " ");
        db.hmget('suggestions', brs, function(err, dat) {
            chan.messages.fetch(dat[0]).then(msg => {
                let embed = new MessageEmbed();
                msg.edit(embed
                    .setTitle(`Сугестија #${brs}`)
                    .setDescription(`Сугестија обрисана ${newstat}`)
                    .setColor('#FF0000')
                )
            });
        });
    }

    if (command === "pravilasugestija" && message.author.id === config.ownerID) {
        message.delete();
        embed = new MessageEmbed()
            .setTitle("Правила и смернице око сугестија")
            .setThumbnail(message.guild.iconURL())
            .setDescription("**Овде можете да дате сугестије око сервера. За сугестије око Меко Мудо инстаграма, јавите се мудо поглаварима.**\n\n• Гласате за сугестију са реакцијом :thumbsup: или :thumbsdown: које Госн мудо бот аутоматски постави\n\n• Сугестије ће се прихватити или одбити од главних муда након најмање 24 часа\n\n• Пишите само сугестије у овом каналу. За расправљање о сугестијама, користите <#670679314538299397>\n\n**Како направити сугестију:**\n\n• Све сугестије се приказују од Госн мудо бота. Само требате да напишете сугестију у чету и аутоматски ће се поставити.\n\n• Све емоџи сугестије морају бити у облику линка иначе неће радити\n\n• У својој сугестији објасните своју сугестију и нагласите због чега би требали да је додамо. На пример, \"*Да се дода команда команда123*\" није довољно, него нам треба и објашњење шта та команда ради.\n\n• **Неозбиљне сугестије се бришу и неомогућава се постављање нових од те особе.**\n")
            .setFooter("Хвала унапред.")
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    function clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

    if (command === "seval" && message.author.id === config.ownerID) {
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }
});

client.login(config.token);