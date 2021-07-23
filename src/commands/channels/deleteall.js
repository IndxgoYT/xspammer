const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    let deleteSuccesses = 0;
    let deleteFails = 0;
    const channels = server.channels.cache;
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
        detail: "Deleting all channels.",
        maxValue: channels.size,
        closeOnComplete: false,
      })
        .on("completed", () => {
          progressBar.text = "Completed";
          progressBar.detail = `Deleted all channels, ${deleteSuccesses} out of ${
            progressBar.getOptions().maxValue
          } channels deleted (${deleteSuccesses} successes, ${deleteFails} fails)`;
          setTimeout(() => progressBar.close(), 1500);
        })
        .on(
          "progress",
          (value) =>
            (progressBar.detail = `Deleting all channels, ${deleteSuccesses} out of ${
              progressBar.getOptions().maxValue
            } channels deleted (${deleteSuccesses} successes, ${deleteFails} fails)`)
        );

      channels.forEach(async (channel) => {
        await channel
          .delete()
          .then(() => {
            deleteSuccesses += 1;
            progressBar.value += 1;
          })
          .catch(() => {
            deleteFails += 1;
            progressBar.value += 1;
          });

        if (progressBar.value === progressBar.maxValue)
          progressBar.setCompleted();
      });
    }, 100);
  },
};
