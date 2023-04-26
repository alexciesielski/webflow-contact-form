export function insertNodeAfter(newNode: Node, existingNode: Node) {
  existingNode.parentNode!.insertBefore(newNode, existingNode.nextSibling);
}
