from os import makedirs


def get_annotation_lists(src_path='./preprocess/labels_list.txt'):
    label1_list, label2_list = [], []
    flag = True
    with open(src_path, 'r') as f:
        raw_data = f.read()
        for line in raw_data.split('\n'):
            if flag:  # label1_list
                if len(line) > 0 and line[0] == '-':
                    label = line.split('(')[0][1:]
                    label1_list.append(label)
                if line.startswith('List of labels 2'):
                    flag = False
            else:  # label2_list
                if len(line) > 0 and line[0] == '-':
                    label = line.split('(')[0][1:]
                    label2_list.append(label)
    return label1_list, label2_list


if __name__ == "__main__":
    label1, label2 = get_annotation_lists()
    print(label1, label2)
