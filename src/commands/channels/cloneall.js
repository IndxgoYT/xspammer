const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    let cloneSuccesses = 0;
    let cloneFails = 0;
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
        detail: "Cloning all channels.",
        maxValue: channels.size,
        closeOnComplete: false,
      })
        .on("completed", () => {
          progressBar.text = "Completed";
          progressBar.detail = `Cloned all channels, ${cloneSuccesses} out of ${
            progressBar.getOptions().maxValue
          } channels cloned (${cloneSuccesses} successes, ${cloneFails} fails)`;
          setTimeout(() => progressBar.close(), 1500);
        })
        .on(
          "progress",
          (value) =>
            (progressBar.detail = `Cloning all channels, ${cloneSuccesses} out of ${
              progressBar.getOptions().maxValue
            } channels cloned (${cloneSuccesses} successes, ${cloneFails} fails)`)
        );

      channels.forEach(async (channel) => {
        await channel
          .clone()
          .then(() => {
            cloneSuccesses += 1;
            progressBar.value += 1;
          })
          .catch(() => {
            cloneFails += 1;
            progressBar.value += 1;
          });

        if (progressBar.value === progressBar.maxValue)
          progressBar.setCompleted();
      });
    }, 100);
  },
};
