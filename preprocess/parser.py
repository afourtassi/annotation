import os
import sys
import json
from xml.etree.ElementTree import parse, fromstring, ElementTree


xmlns = 'http://www.talkbank.org/ns/talkbank'
xmlns_str = '{' + xmlns + '}'

class XMLNamespaces:
    def __init__(self, **kwargs):
        self.namespaces = {}
        for name, uri in kwargs.items():
            self.register(name, uri)
    def register(self, name, uri):
        self.namespaces[name] = '{'+uri+'}'
    def __call__(self, path):
        return path.format_map(self.namespaces)


ns = XMLNamespaces(html=xmlns)


def translate_to_json(doc: ElementTree, file_name='NULL'):
    dialogue = {
                "header": {
                    "id": "NULL",
                    "filename": file_name,
                    "labels_child": [
                        "child_act_1",
                        "child_act_2",
                        "child_act_3",
                        "NULL"
                        ],
                    "labels_parent": [
                        "parent_act_1",
                        "parent_act_2",
                        "parent_act_3",
                        "NULL"
                        ],
                    "participants": []
                },
                "annotation": {},
                "documents": []
                }
    for k, v in doc.getroot().attrib.items():
        dialogue['header'][k] = v
    dialogue['header']['id'] = doc.getroot().get('PID')
    for node in doc.getroot():
        # possible node types:
        # 1. Participants;
        # 2. u: utterance;
        # 3. comment: comments;
        if node.tag == ns('{html}Participants'):
            for p_node in node:
                if p_node.tag == ns('{html}participant'):
                    dialogue["header"]["participants"].append(p_node.attrib)
                else:
                    raise TypeError(f'Participants/{p_node.tag.replace(xmlns_str, "")}')
        elif node.tag == ns('{html}u'):
            words = []
            explanation = []
            for u_node in node:
                # print(u_node.tag)
                if u_node.tag == ns('{html}w'):
                    words.append(u_node.text)
                elif u_node.tag == ns('{html}a'):
                    # words.append(u_node.text)
                    if u_node.get('type') == 'addressee':
                        explanation.append('ADD: ' + u_node.text)
                    elif u_node.get('type') == 'explanation':
                        explanation.append('Explanation: ' + u_node.text)
                    elif u_node.get('type') == 'situation':
                        explanation.append('Situation: ' + u_node.text)
                    elif u_node.get('type') == 'comments':
                        explanation.append('Comments: ' + u_node.text)
                    elif u_node.get('type') == 'actions':
                        explanation.append('Actions: ' + u_node.text)
                    else:
                        explanation.append(u_node.get('type').title() + ': ' + u_node.text)
                        # raise TypeError(f"Unknown type: {u_node.get('type')}")
                elif u_node.tag == ns('{html}g'):
                    for g_node in u_node:
                        if g_node.tag == ns('{html}w'):
                            words.append(g_node.text)
                        elif g_node.tag in (ns('{html}error')):
                            continue
                        elif g_node.tag in (ns('{html}k')):
                            continue
                        elif g_node.tag in (ns('{html}r')):
                            words.append(f'x{g_node.get("times")}')
                        else:
                            if u_node.text:
                                words.append(f"<{u_node.get('type')}> {u_node.text}")
                            else:
                                words.append(f"<{u_node.get('type')}>")
                            # raise TypeError(f'u/g/{g_node.tag.replace(xmlns_str, "")}')
                elif u_node.tag == ns('{html}pause'):
                    words.append(".")
                elif u_node.tag == ns('{html}tagMarker'):
                    if u_node.get('type') == 'comma':
                        words.append(",")
                    elif u_node.get('type') == 'tag':
                        words.append("#")
                    else:
                        print(u_node.attrib)
                        raise TypeError(f'tagMarker: {u_node.get("type")}')
                elif u_node.tag in (ns('{html}t')):
                    if u_node.get('type') == 'q':
                        words.append("?")
                    elif u_node.get('type') == 'p':
                        words.append(".")
                    elif u_node.get('type') == 'e':
                        words.append("!")
                    elif u_node.get('type') == 's':
                        words.append(";")
                    elif u_node.get('type') == 'trail off':
                        words.append("...")
                    else:
                        if u_node.text:
                            words.append(f"<{u_node.get('type')}> {u_node.text}")
                        else:
                            words.append(f"<{u_node.get('type')}>")
                        # raise TypeError(f'Unknown type: {u_node.get("type")}')
                elif u_node.tag in (ns('{html}quotation')):
                    words.append('"')
                elif u_node.tag in (ns('{html}e')):
                    words.append('0.')
                elif u_node.tag in (ns('{html}s')):
                    words.append(';')
                elif u_node.tag in (ns('{html}linker')):
                    words.append('<quote>')
                elif u_node.tag in (ns('{html}pg')):
                    pass
                elif u_node.tag in (ns('{html}media')):
                    words.append('<media>')
                elif u_node.tag in (ns('{html}postcode')):
                    words.append('<postcode>')
                else:
                    print(u_node.attrib)
                    raise TypeError(f'u/{u_node.tag.replace(xmlns_str, "")}')
            line = {
                    'type': 'utterance',
                    'annotable': True,
                    'turn': ' '.join([x for x in words if x]),  # Avoid NoneType Error
                    'explanation': ' '.join(explanation),
                    'subject': node.get('who'),
                    'id': node.get('uID'),
                    'label': 'NULL',
                    'status_seg': 'G',
                    'status_lab': 'G'
                    }
            dialogue['documents'].append(line)
        elif node.tag == ns('{html}comment'):
            line = {
                    'type': 'comment',
                    'annotable': False,
                    'turn': node.text,
                    'explanation': node.get('type')
                    }
            dialogue['documents'].append(line)
        elif node.tag in (ns('{html}lazy-gem'), ns('{html}begin-gem'), ns('{html}end-gem')):
            line = {
                    'type': 'gem',
                    'annotable': False,
                    'turn': node.get('label'),
                    'explanation': node.tag.replace(xmlns_str, ""),
                    }
            dialogue['documents'].append(line)
        else:
            print(node.tag.replace(xmlns_str, ""), node.attrib)
            raise TypeError(f'CHAT/{node.tag.replace(xmlns_str, "")}')
    return dialogue


if __name__ == "__main__":
    dir_path = 'VionColas/'

    for sub_path in os.listdir(dir_path):
        for filename in os.listdir(os.path.join(dir_path, sub_path)):
            doc = parse(os.path.join(dir_path, sub_path, filename))
            print(filename)
            d = translate_to_json(doc)
            with open('tmp.json', 'w') as f:
                json.dump(d, f, indent=4)
            break
        break
