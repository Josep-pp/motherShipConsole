import { afterNextRender, AfterViewInit, Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { Terminal } from '../../services/terminal';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-console',
  styleUrl: './console.scss',
  templateUrl: './console.html',
    host: {
    '(window:focus)': 'focusInput()',
    '(document:click)': 'onDocumentClick($event)'
  },
})
export class Console implements AfterViewInit{

  terminalService = inject(Terminal);

  @ViewChild('cmdInput') cmdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContainer') terminalContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('historyContainer') historyContainer!: ElementRef<HTMLDivElement>;

  username = this.terminalService.username;
  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;

  constructor() {
    effect(() => {
    
      this.terminalService.history();

      afterNextRender({
        earlyRead: () => {
          return this.historyContainer?.nativeElement.scrollHeight;
        },

        write: (scrollHeight) => {
          if (scrollHeight !== undefined) {
            const history = this.historyContainer.nativeElement;
            history.scrollTop = scrollHeight;
          }
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  focusInput(): void {
    this.cmdInput.nativeElement.focus();
  }

  onEnter(): void {
    if (this.currentCommand.trim()) {
      this.commandHistory.push(this.currentCommand);
      this.historyIndex = this.commandHistory.length;
    }
    this.terminalService.executeCommand(this.currentCommand);
    this.currentCommand = '';
  }

  navigateHistory(direction: number, event: Event): void {
    event.preventDefault();
    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.currentCommand = '';
      return;
    }

    this.currentCommand = this.commandHistory[this.historyIndex];
  }

  handleTab(event: Event): void {
  event.preventDefault(); // Stop the browser from focusing the next element

  const input = this.currentCommand.trim().toLowerCase();
  if (!input || input.includes(' ')) return; // Only autocomplete the main command

  const available = this.terminalService.getAvailableCommands();
  const matches = available.filter(cmd => cmd.startsWith(input));

  if (matches.length === 1) {

    this.currentCommand = matches[0] + ' ';

  } else if (matches.length > 1) {

    this.terminalService.history.update(h => [
      ...h,
      { type: 'input', text: `${this.username()} ${this.currentCommand}` },
      { type: 'output', text: matches.join('   ') }

    ]);
  }
  setTimeout(() => this.focusInput(), 0);
}
  onDocumentClick(event: MouseEvent): void {

    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      this.focusInput();
    }
    
  }
}
