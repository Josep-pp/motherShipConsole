import { Service, signal } from '@angular/core';

export interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

export interface Door {
  status: 'open' | 'closed';
  name: string;
}

@Service()
export class Terminal {


    username = signal('guest :');

    doors = signal<Door[]>([
        { status: 'closed', name: 'Infirmary' },
        { status: 'open', name: 'Bridge' },
        { status: 'closed', name: 'Engine_Room' }
    ]);

    history = signal<TerminalLine[]>([
        { type: 'output', text: 'Welcome to MotherShip Terminal System' },
        { type: 'output', text: 'Type "help" to see the available commands.' }
    ]);

      // Dictionary of commands and their corresponding functions
  private commands: Record<string, (arg: string) => string> = {
    help: () => {

      if (this.username() === 'root :') {
        return 'List of commands:\n' +
        '  help           - Show this help\n' +
        '  about          - System information\n' +
        '  clear          - Clear the terminal\n' +
        '  doors          - List all doors and their status\n' +
        '  open <door>    - Open a specific door\n' +
        '  close <door>   - Close a specific door\n';
      }

      return 'List of commands:\n' +
      '  help          - Show this help\n' +
      '  about         - System information\n' +
      '  clear         - Clear the terminal\n' +
      '  log           - Activate admin mode (requires password)\n';

    },
    
    
    about: () => {

      return 'MotherShip Terminal System v1.5.3\n';
    },

    log: (arg) => {

      if (arg === '1234'){
      this.username.set('root :');
      return 'Admin mode activated. You are now logged in as root.\n'+
      'Type "help" to see available commands.';
      }else{
        return 'Incorrect password. Access denied.';
      }

    },

    doors: () => {
      const doorsList = this.doors().map(door => `${door.name}: ${door.status}`).join('\n');
      return `Doors status:\n${doorsList}`;
    },

    open: (doorName) => {
      const doors = this.doors();
      const doorIndex = doors.findIndex(door => door.name.toLowerCase() === doorName.toLowerCase());
      if (doorIndex !== -1) {
        if (doors[doorIndex].status === 'open') {
          return `The ${doors[doorIndex].name} is already open.`;
        }
        doors[doorIndex].status = 'open';
        this.doors.set([...doors]);
        return `The ${doors[doorIndex].name} has been opened.`;
      } else {
        return `Door "${doorName}" not found.`;
      }
    },

    close: (doorName) => {
      const doors = this.doors();
      const doorIndex = doors.findIndex(door => door.name.toLowerCase() === doorName.toLowerCase());
      if (doorIndex !== -1) {
        if (doors[doorIndex].status === 'closed') {
          return `The ${doors[doorIndex].name} is already closed.`;
        }
        doors[doorIndex].status = 'closed';
        this.doors.set([...doors]);
        return `The ${doors[doorIndex].name} has been closed.`;
      } else {
        return `Door "${doorName}" not found.`;
      }
    }
  };

  executeCommand(rawInput: string): void {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    this.addLine('input', this.username()+` ${trimmed}`);

    const [cmd, arg] = trimmed.split(' ');
    const commandKey = cmd.toLowerCase();

    if (commandKey === 'clear') {
      this.history.set([]);
      return;
    }

    if (this.commands[commandKey]) {
      const response = this.commands[commandKey](arg);
      if (response) {
        this.addLine('output', response);
      }
    } else {
      this.addLine('error', `Comando no encontrado: "${cmd}". Escribe "help" para ayuda.`);
    }
  }

  private addLine(type: TerminalLine['type'], text: string): void {
    this.history.update(current => [...current, { type, text }]);
  }

  getAvailableCommands(): string[] {
  return [...Object.keys(this.commands), 'clear'];
}

}
