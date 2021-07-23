const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Amount of messages to purge (0 for max):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((a) => {
      let amount = parseInt(a);

      if (amount < 1 || amount > 100) amount = 100;
      if (isNaN(amount) || amount < 1) amount = 1;

      let purgeSuccesses = 0;
      let purgeFails = 0;
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
          detail: `Purging ${amount} messages in all channels.`,
          maxValue: channels.size,
          closeOnComplete: false,
        })
          .on("completed", () => {
            progressBar.text = "Completed";
            progressBar.detail = `Purged ${amount} messages in all channels, ${purgeSuccesses} out of ${
              progressBar.getOptions().maxValue
            } channels purged (${purgeSuccesses} successes, ${purgeFails} fails)`;
            setTimeout(() => progressBar.close(), 1500);
          })
          .on(
            "progress",
            (value) =>
              (progressBar.detail = `Purged ${amount} messages in all channels, ${purgeSuccesses} out of ${
                progressBar.getOptions().maxValue
              } channels purged (${purgeSuccesses} successes, ${purgeFails} fails)`)
          );

        channels.forEach(async (channel) => {
          await channel
            .bulkDelete(amount)
            .then(() => {
              purgeSuccesses += 1;
              progressBar.value += 1;
            })
            .catch(() => {
              purgeFails += 1;
              progressBar.value += 1;
            });

          if (progressBar.value === progressBar.maxValue)
            progressBar.setCompleted();
        });
      }, 100);
    });
  },
};
