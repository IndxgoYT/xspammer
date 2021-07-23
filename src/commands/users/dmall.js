const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt(
      {
        title: "XSpammer",
        label: "Message to send:",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      },
      {
        type: "warning",
        title: "XSpammer",
        message: "You didn't provide a message.",
      }
    ).then((message) => {
      showPrompt(
        {
          title: "XSpammer",
          label: "Amount of times to send (1 - 100):",
          alwaysOnTop: true,
          skipTaskbar: false,
          type: "input",
        },
        {
          type: "warning",
          title: "XSpammer",
          message: "You didn't provide an amount.",
        }
      ).then((a) => {
        let amount = parseInt(a);
        if (isNaN(amount) || amount < 1) amount = 1;
        if (amount > 100) amount = 100;

        let dmSuccesses = 0;
        let dmFails = 0;
        const members = server.members.cache.filter((m) => !m.user.bot);
        setTimeout(() => {
          const progressBar = new ProgressBar({
            indeterminate: false,
            title: "XSpammer",
            text: "Wait...",
            detail: "DMing all users.",
            maxValue: members.size * amount,
            closeOnComplete: false,
          })
            .on("completed", () => {
              progressBar.text = "Completed";
              progressBar.detail = `DMed all users ${amount} times each, ${dmSuccesses} out of ${
                progressBar.getOptions().maxValue
              } messages sent (${dmSuccesses} successes, ${dmFails} fails)`;
              setTimeout(() => progressBar.close(), 1500);
            })
            .on(
              "progress",
              (value) =>
                (progressBar.detail = `DMing all users ${amount} times each, ${dmSuccesses} out of ${
                  progressBar.getOptions().maxValue
                } messages sent (${dmSuccesses} successes, ${dmFails} fails)`)
            );

          members.forEach(async (member) => {
            const msg = message
              .replace(/\\n/g, "\n")
              .replace(/%user%/g, `<@${member.user.id}>`)
              .replace(/%username%/g, member.user.username)
              .replace(/%userid%/g, member.user.id)
              .replace(/%usertag%/g, member.user.tag)
              .replace(/%server%/g, server.name);

            await [...Array(amount)].forEach(async () => {
              await member
                .send(msg)
                .then(() => {
                  dmSuccesses += 1;
                  progressBar.value += 1;
                })
                .catch(() => {
                  dmFails += 1;
                  progressBar.value += 1;
                });
            });

            if (progressBar.value === progressBar.maxValue)
              progressBar.setCompleted();
          });
        }, 100);
      });
    });
  },
};
