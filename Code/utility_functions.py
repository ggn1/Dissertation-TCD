from colorama import Fore
from colorama import Back
from colorama import Style

COLORS = {
    'fg': {
        'black': Fore.BLACK,
        'red': Fore.RED,
        'green': Fore.GREEN,
        'yellow': Fore.YELLOW,
        'blue': Fore.BLUE,
        'magenta': Fore.MAGENTA,
        'cyan': Fore.CYAN,
        'white': Fore.WHITE
    },
    'bg': {
        'black': Back.BLACK,
        'red': Back.RED,
        'green': Back.GREEN,
        'yellow': Back.YELLOW,
        'blue': Back.BLUE,
        'magenta': Back.MAGENTA,
        'cyan': Back.CYAN,
        'white': Back.WHITE
    }
}

def print_color(txt:str, fg:str, bg:str=None):
    ''' Prints colored text.
        @param txt: Text to print.
        @param fg: Color of foreground. 
        @param bg: Color of background.
        Color Options: black, red, green, yellow, blue, 
                       magenta, cyan, white.
    '''
    fg = fg.lower()
    bg = bg.lower()

    # Color input sanity checks.
    if fg not in list(COLORS['fg'].keys()):
        raise Exception(
            "utility_functions>print_color()>'Invalid foreground color. "
            + f"Valid color options = {','.join(list(COLORS['fg'].keys()))}"
            + f"{Style.RESET_ALL}"
        )
    if bg not in list(COLORS['bg'].keys()):
        raise Exception(
            "utility_functions>print_color()>'Invalid background color. "
            + f"Valid color options = {','.join(list(COLORS['bg'].keys()))}"
            + f"{Style.RESET_ALL}"
        )
    
    # Print in color.
    if bg is not None:
        print(f'{COLORS["bg"][bg]}{COLORS["fg"][fg]}{txt}')
    else: print(f'{COLORS["bg"][bg]}{txt}')