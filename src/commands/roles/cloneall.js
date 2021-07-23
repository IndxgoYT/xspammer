const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    let cloneSuccesses = 0;
    let cloneFails = 0;
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
        detail: "Cloning all roles.",
        maxValue: roles.size,
        closeOnComplete: false,
      })
        .on("completed", () => {
          progressBar.text = "Completed";
          progressBar.detail = `Cloned all roles, ${cloneSuccesses} out of ${
            progressBar.getOptions().maxValue
          } roles cloned (${cloneSuccesses} successes, ${cloneFails} fails)`;
          setTimeout(() => progressBar.close(), 1500);
        })
        .on(
          "progress",
          (value) =>
            (progressBar.detail = `Cloning all roles, ${cloneSuccesses} out of ${
              progressBar.getOptions().maxValue
            } roles cloned (${cloneSuccesses} successes, ${cloneFails} fails)`)
        );

      roles.forEach(async (role) => {
        await server.roles
          .create({
            data: {
              name: role.name,
              color: role.color,
              hoist: role.hoist,
              position: role.position,
              permissions: role.permissions,
              mentionable: role.mentionable,
            },
          })
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
