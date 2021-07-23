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

      showPrompt({
        title: "XSpammer",
        label: "Name (optional):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((n) => {
        let name = n;
        if (!name) name = "XSpammer rules!";

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Renaming ${channel.name}.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          const _name = name
            .replace(/\\n/g, "\n")
            .replace(/%server%/g, server.name);

          const prevName = channel.name;

          await channel
            .setName(_name)
            .then(() => (progressBar.detail = `Renamed ${prevName}`))
            .catch(
              () => (progressBar.detail = `Failed to rename ${channel.name}`)
            )
            .finally(() => progressBar.setCompleted());
        }, 100);
      });
    });
  },
};
