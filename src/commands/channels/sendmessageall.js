const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Message (optional):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((m) => {
      let message = m;
      if (!message) message = "XSpammer rules!";
      const _message = message
        .replace(/\\n/g, "\n")
        .replace(/%server%/g, server.name);

      showPrompt({
        title: "XSpammer",
        label: "Amount of times to send (optional):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((a) => {
        let amount = parseInt(a);

        if (amount > 100) amount = 100;
        if (isNaN(amount) || amount < 1) amount = 1;

        let sentSuccesses = 0;
        let sentFails = 0;
        const channels = server.channels.cache.filter((c) => c.type === "text");
        if (channels.size < 1) {
          remote.dialog.showMessageBox(null, {
            type: "error",
            title: "XSpammer",
            message: "There aren't enough channels for this command.",
          });
          return;
        }
        setTimeout(() => {
          const progressBar = new ProgressBar({
            indeterminate: false,
            title: "XSpammer",
            text: "Wait...",
            detail: `Sending ${amount} messages in all channels.`,
            maxValue: channels.size * amount,
            closeOnComplete: false,
          })
            .on("completed", () => {
              progressBar.text = "Completed";
              progressBar.detail = `Sent ${amount} messages in all channels, ${sentSuccesses} out of ${
                progressBar.getOptions().maxValue
              } messages sent (${sentSuccesses} successes, ${sentFails} fails)`;
              setTimeout(() => progressBar.close(), 1500);
            })
            .on(
              "progress",
              (value) =>
                (progressBar.detail = `Sending ${amount} messages in all channels, ${sentSuccesses} out of ${
                  progressBar.getOptions().maxValue
                } messages sent (${sentSuccesses} successes, ${sentFails} fails)`)
            );

          channels.forEach(async (channel) => {
            await [...Array(amount)].forEach(async () => {
              await channel
                .send(_message)
                .then(() => {
                  sentSuccesses += 1;
                  progressBar.value += 1;
                })
                .catch(() => {
                  sentFails += 1;
                  progressBar.value += 1;
                });

              if (progressBar.value === progressBar.maxValue)
                progressBar.setCompleted();
            });
          });
        }, 100);
      });
    });
  },
};
