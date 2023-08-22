import inspect
import datetime
import pandas as pd
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
    # Color input sanity checks.
    fg = fg.lower()
    if fg not in list(COLORS['fg'].keys()):
        raise Exception(
            "utility_functions>print_color()>'Invalid foreground color. "
            + f"Valid color options = {','.join(list(COLORS['fg'].keys()))}"
        )
    if bg is not None:
        bg = bg.lower() if bg is not None else bg
        if bg not in list(COLORS['bg'].keys()):
            raise Exception(
                "utility_functions>print_color()>'Invalid background color. "
                + f"Valid color options = {','.join(list(COLORS['bg'].keys()))}"
            )
    
    # Print in color.
    if bg is not None: print(f'{COLORS["bg"][bg]}{COLORS["fg"][fg]}{txt}{Style.RESET_ALL}')
    else: print(f'{COLORS["fg"][fg]}{txt}{Style.RESET_ALL}')

def desc_df(df:pd.core.frame.DataFrame):
    ''' Describes a given pandas data frame. '''
    print(f"No. of rows = {len(df)}\nNo. of columns = {len(df.columns)}")
    print_color(f"\nFeature Overview", "yellow")
    print(df.info())
    print_color("\nValue Counts", "yellow")
    for feature in df.columns:
        vc = df[feature].value_counts()
        print(f"\n{vc}")
        print(f'No. of distinct values = {len(vc)}')
        print(f'No. of missing values = {df[feature].isna().sum()}')
    print(f"Column Names = {list(df.columns)}")
    display(df.head())

def inspect_function(func):
    ''' Inspects a function and prints it's name and argument list. '''
    sig = inspect.signature(func)
    print(f"\nFUNCTION {func.__name__}(...):")
    params = list(sig.parameters.keys())
    for i in range(len(params)): print(f"{i+1}. {sig.parameters[params[i]]}")

def get_now():
    ''' Get's latest dat time. 
        @return day, month, year, hour, minutes, seconds.
    '''
    now = datetime.datetime.now()
    return {
        'day': now.day, 'month': now.month, 'year': now.year,
        'hour': now.hour, 'minute': now.minute, 'second': now.second,
    }
