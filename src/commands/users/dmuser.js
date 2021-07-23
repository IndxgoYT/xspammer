const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt(
      {
        title: "XSpammer",
        label: "Select a user:",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "select",
        selectOptions: server.members.cache
          .filter((m) => !m.user.bot)
          .reduce(function (result, item) {
            result[item.user.id] = item.user.tag;
            return result;
          }, {}),
      },
      {
        type: "warning",
        title: "XSpammer",
        message: "You didn't select a user.",
      }
    ).then((userid) => {
      const member = server.members.cache.get(userid);

      if (!member) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "An error occurred while trying to fetch the user.",
        });
        return;
      }

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
          setTimeout(async () => {
            const progressBar = new ProgressBar({
              indeterminate: false,
              title: "XSpammer",
              text: "Wait...",
              detail: `DMing ${member.user.tag}.`,
              maxValue: amount,
            })
              .on("completed", () => {
                progressBar.text = "Completed";
                progressBar.detail = `DMed ${
                  member.user.tag
                } ${amount} times, ${dmSuccesses} out of ${
                  progressBar.getOptions().maxValue
                } messages sent (${dmSuccesses} successes, ${dmFails} fails)`;
                setTimeout(() => progressBar.close(), 1500);
              })
              .on(
                "progress",
                (value) =>
                  (progressBar.detail = `DMing ${
                    member.user.tag
                  } ${amount} times, ${dmSuccesses} out of ${
                    progressBar.getOptions().maxValue
                  } messages sent (${dmSuccesses} successes, ${dmFails} fails)`)
              );

            await [...Array(amount)].forEach(async () => {
              const msg = message
                .replace(/\\n/g, "\n")
                .replace(/%user%/g, `<@${member.user.id}>`)
                .replace(/%username%/g, member.user.username)
                .replace(/%userid%/g, member.user.id)
                .replace(/%usertag%/g, member.user.tag)
                .replace(/%server%/g, server.name);

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

              if (progressBar.value === progressBar.maxValue)
                progressBar.setCompleted();
            });
          }, 100);
        });
      });
    });
  },
};
