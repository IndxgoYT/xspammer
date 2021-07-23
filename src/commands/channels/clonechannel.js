const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    if (server.channels.cache.size < 1) {
      remote.dialog.showMessageBox(null, {
        type: "error",
        title: "XSpammer",
        message: "There aren't enough channels for this command.",
      });
      return;
    }

    showPrompt(
      {
        title: "XSpammer",
        label: "Select a channel:",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "select",
        selectOptions: server.channels.cache.reduce(function (result, item) {
          result[item.id] = item.name;
          return result;
        }, {}),
      },
      {
        type: "warning",
        title: "XSpammer",
        message: "You didn't select a channel.",
      }
    ).then((channelid) => {
      const channel = server.channels.cache.get(channelid);

      if (!channel) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "An error occurred while trying to fetch the channel.",
        });
        return;
      }

      setTimeout(async () => {
        const progressBar = new ProgressBar({
          title: "XSpammer",
          text: "Wait...",
          detail: `Cloning ${channel.name}.`,
        }).on("completed", () => {
          progressBar.text = "Completed";
          setTimeout(() => progressBar.close(), 1500);
        });

        await channel
          .clone()
          .then(() => (progressBar.detail = `Cloned ${channel.name}`))
          .catch(() => (progressBar.detail = `Failed to clone ${channel.name}`))
          .finally(() => progressBar.setCompleted());
      }, 100);
    });
  },
};
