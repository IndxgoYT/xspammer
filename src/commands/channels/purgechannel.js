const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    if (server.channels.cache.filter((c) => c.type === "text").size < 1) {
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
        selectOptions: server.channels.cache
          .filter((c) => c.type === "text")
          .reduce(function (result, item) {
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

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Purging ${amount} messages in ${channel.name}.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          await channel
            .bulkDelete(amount)
            .then(
              (messages) =>
                (progressBar.detail = `Purged ${messages.size} out of ${amount} messages in ${channel.name}`)
            )
            .catch(
              () =>
                (progressBar.detail = `Failed to purge ${amount} messages in ${channel.name}`)
            )
            .finally(() => progressBar.setCompleted());
        }, 100);
      });
    });
  },
};
