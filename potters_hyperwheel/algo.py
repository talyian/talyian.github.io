from pprint import *

tree = (7,
        (3,
         (1,),
         (4,)),
        (8,
         (7.5,),
         (1,)))

pprint(tree)

def size(node):
    if len(node) == 1: return 1
    return size(node[1]) + size(node[2]) + 1

def rank(value, node, index):
    if len(node) == 1:
        return index if value == node[0] else -1
    if (value < node[0]): return rank(value, node[1], index)
    if (value > node[0]): return rank(value, node[2], index + 1 + size(node[1]))
    return index + size(node[1])

for i in [1, 2, 3, 4, 7, 7.5, 8, 9]:
    print(i, '-->', rank(i, tree, 0))
