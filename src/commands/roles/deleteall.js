const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    let deleteSuccesses = 0;
    let deleteFails = 0;
    const roles = server.roles.cache.filter((r) => r.name !== "@everyone");
    if (roles.size < 1) {
      remote.dialog.showMessageBox(null, {
        type: "error",
        title: "XSpammer",
        message: "There aren't enough roles for this command.",
      });
      return;
    }
    setTimeout(() => {
      const progressBar = new ProgressBar({
        indeterminate: false,
        title: "XSpammer",
        text: "Wait...",
        detail: "Deleting all roles.",
        maxValue: roles.size,
        closeOnComplete: false,
      })
        .on("completed", () => {
          progressBar.text = "Completed";
          progressBar.detail = `Deleted all roles, ${deleteSuccesses} out of ${
            progressBar.getOptions().maxValue
          } roles deleted (${deleteSuccesses} successes, ${deleteFails} fails)`;
          setTimeout(() => progressBar.close(), 1500);
        })
        .on(
          "progress",
          (value) =>
            (progressBar.detail = `Deleting all roles, ${deleteSuccesses} out of ${
              progressBar.getOptions().maxValue
            } roles deleted (${deleteSuccesses} successes, ${deleteFails} fails)`)
        );

      roles.forEach(async (role) => {
        await role
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
