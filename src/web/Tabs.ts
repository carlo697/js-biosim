export class Tab {
  constructor(
    public button: HTMLElement,
    public content: HTMLElement,
    public group: TabGroup,
    public isDefault: boolean = false
  ) {
    if (isDefault) {
      button.classList.add("active");
    } else {
      content.classList.add("hide");
    }
    button.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(): void {
    // Hide contents
    this.group.contents.forEach((content) => content.classList.add("hide"));
    this.group.tabs.forEach((tab) => tab.button.classList.remove("active"));

    // Show content
    this.content.classList.remove("hide");

    this.button.classList.add("active");
  }
}

export class TabGroup {
  tabs: Tab[] = [];
  contents: HTMLElement[] = [];

  constructor(group: HTMLElement | undefined | null) {
    if (group) {
      const tabs = Array.from(
        group.querySelectorAll<HTMLElement>("[data-tab-target]")
      );

      let firstContent: HTMLElement | undefined;

      tabs.forEach((tab: HTMLElement) => {
        const targetId = tab.getAttribute("data-tab-target");
        if (targetId) {
          const content = group.querySelector<HTMLElement>(`#${targetId}`);

          if (content) {
            if (!firstContent) {
              firstContent = content;
            }

            this.contents.push(content);

            this.tabs.push(
              new Tab(tab, content, this, firstContent === content)
            );
          }
        }
      });
    }
  }
}

export const initializeTabsInDOM = () => {
  const groups = Array.from(
    document.querySelectorAll<HTMLElement>("[data-tab-group]")
  );

  groups.forEach((group) => {
    new TabGroup(group);
  });
};
