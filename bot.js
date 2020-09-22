const { Client, MessageEmbed } = require('discord.js');
const config = require("./config.json");
const rules = require("./rules.json");
const fs = require("fs");
const client = new Client();
let embed = "";

client.on('ready', () => {
    console.log('active');
    let d = new Date();
    if (d.getHours() === 23 && d.getMinutes() > 58) {
        const srv = client.guilds.cache.get(config.server);
        let data = [`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`, srv.memberCount - 6];
        fs.readFile('/var/www/html/members.json', 'utf8', function(err, fl) {
            if (err) console.log(err);
            else {
                let mlog = JSON.parse(fl);
                mlog.members.push(data);
                let json = JSON.stringify(mlog);
                fs.writeFile('/var/www/html/members.json', json, 'utf8', function(err) {
                    if (err) console.log(err);
                });
            }
        });
    }
});

client.on('message', message => {
    if (!message.guild) return;
    let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cntnt = message.content.slice(config.prefix.length).slice(command.length).trim();

    if (command === "pravilo") {
        if (cntnt === "1" || cntnt === "2" || cntnt === "3" || cntnt === "4") {
            const ru = "rules.p".concat(cntnt);
            const ruhd = ru.concat("h");
            embed = new MessageEmbed()
                .setTitle(eval(ruhd))
                .setDescription(eval(ru))
                .setColor('#00FF00');
            message.channel.send(embed);
        } else if (cntnt === "69" || cntnt === "34") {
            embed = new MessageEmbed()
                .setTitle("Ајде бре перверзњаку, неш јебат")
                .setColor('#FF0000');
            message.channel.send(embed);
        } else if (cntnt === "8") {
            embed = new MessageEmbed()
                .setTitle("На курцу те носам")
                .setColor('#FF0000');
            message.channel.send(embed);
        } else {
            embed = new MessageEmbed()
                .setTitle("Шта си ти, неки шаљивџија? Не постоји то правило")
                .setColor('#FF0000');
            message.channel.send(embed);
        }
    }

    if (message.author.id === '159985870458322944' && message.channel.id === '670679314538299397') {
        embed = new MessageEmbed()
            .setDescription("**Ћути бе, јебем ти матер, никог не занима**")
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    if (message.content.match(/( {1}|^)l+i+z+( {1}|$)/igm)) {
        const liz = client.emojis.cache.get('748346624517996656');
        message.channel.send(`${liz}`).catch(console.error);
    }

    if (message.content.match(/( {1}|^)л+и+з+( {1}|$)/igm)) {
        const liz = client.emojis.cache.get('748346624517996656');
        message.channel.send(`${liz}`).catch(console.error);
    }

    if (command === "mb") {
        embed = new MessageEmbed()
            .setTitle(`Број чланова: ${message.guild.memberCount - 6}`)
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    if (command === "pravila" && message.author.id === config.ownerID) {
        message.delete();
        embed = new MessageEmbed()
            .setTitle("Правила Меко Мудо сервера")
            .setThumbnail(message.guild.iconURL())
            .setDescription("Овде су сва правила сервера. Важе за свакога и у свим каналима. Молимо вас да се понашате колико-толико цивилизовано и по овим правилима.")
            .addField(rules.p1h, rules.p1)
            .addField(rules.p2h, rules.p2)
            .addField(rules.p3h, rules.p3)
            .addField(rules.p4h, rules.p4)
            .setFooter("Тим главних муда има право на свако додатно кажњавање које није на овом списку ако се успостави да је потребно.")
            .setColor('#00FF00');
        message.channel.send(embed);
        embed = new MessageEmbed()
            .setTitle("Позивање главних муда")
            .setDescription("Ако видите нешто што је против правила (нпр. неко вам псује породицу) или вам за нешто требају главна муда, користите <@&670680875008000000> у чету да нам довучете пажњу")
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    if (command === "say" && message.member.roles.cache.has(config.modID)) {
        message.delete();
        embed = new MessageEmbed()
            .setDescription(cntnt)
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    if (command === "title" && message.member.roles.cache.has(config.modID)) {
        message.delete();
        embed = new MessageEmbed()
            .setTitle(cntnt)
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    if (command === "help" && message.member.roles.cache.has(config.modID)) {
        embed = new MessageEmbed()
            .setThumbnail(message.guild.iconURL())
            .setTitle(`Помоћ за модераторе`)
            .addField(".mb", "Приказује број чланова у серверу")
            .addField(".pravilo [n]", "Приказује правило број под бројем n")
            .addField(".say [text]", "Изговара текст малим словима као бот")
            .addField(".title [text]", "Изговара текст великим словима као бот")
            .addField(".start", "Започиње нову причу по једну реч")
            .addField(".stop", "Зауставља текућу причу по једну реч")
            .addField(".sugestija [n] [novi status]", "Мења статус сугестије n у нови статус")
            .addField(".obrisisugestiju [n] [razlog]", "Брише сугестију n са наведеним разлогом")
            .setColor('#00FF00');
        message.channel.send(embed);
    }

    function clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

    if (command === "eval" && message.author.id === config.ownerID) {
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

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) return console.log("channel not found");
    embed = new MessageEmbed()
        .setTitle("Ново мудо је пристигло!")
        .setDescription(`Помаже Бог **${member.user.tag}** и добродошао у Меко Мудо кутак, леп провод!`)
        .addField("Шта сад?", "За почетак провери \"важно\" секцију са правилима и обавештењима")
        .setThumbnail(member.user.displayAvatarURL())
        .setColor('#00FF00');
    channel.send(embed)
        .then(r => r.react('👋'));
});

client.login(config.token);