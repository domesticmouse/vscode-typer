import * as jsdiff from 'diff';
import * as path from 'path';
import * as vscode from 'vscode';
import * as promisify from 'es6-promisify';

function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function activate(context: vscode.ExtensionContext) {
  const updater = new Updater();
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestResetMain',
      (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        updater.reset(textEditor, edit);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestNext',
      (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        updater.next(textEditor, edit);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'extension.devFestPrevious',
      (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        updater.previous(textEditor, edit);
      },
    ),
  );
}

class Updater {
  private step = 0;
  private steps = [
    // Step-01
    `
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: const Text('Hi, DevFest'),
      );
}
`,
    // Step-02
    `
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: const Center(
          child: Text(
            'Hi, DevFest',
            style: TextStyle(fontSize: 20),
          ),
        ),
      );
}
`,
    // Step-03
    `
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: ListView(
          children: const [
            ListTile(
              title: Text(
                'Hi, DevFest',
                style: TextStyle(fontSize: 20),
              ),
            ),
            ListTile(
              title: Text(
                'ListViews are fun ;-)',
                style: TextStyle(fontSize: 20),
              ),
            ),
          ],
        ),
      );
}
`,
    // Step-04
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) {
                  final data = snapshot.data.documents[index].data;
                  return ListTile(
                    title: Text(data['shortDescription'] as String),
                    subtitle: Text('Photo by \${data['photographer']}'),
                  );
                });
          },
        ),
      );
}
`,
    // Step-05
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                    ));
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document});
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Image(
        image: AssetImage(document.data['imagePath'] as String),
      );
}
`,
    // Step-06
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Image(
        image: AssetImage(document.data['imagePath'] as String),
      );
}
`,
    // Step-07
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Stack(
        alignment: const Alignment(0.85, 0.9),
        children: [
          Image(
            image: AssetImage(document.data['imagePath'] as String),
          ),
          document.data['favourited'] as bool
              ? const Icon(Icons.favorite, color: Colors.red)
              : null
        ].where((child) => child != null).toList(),
      );
}
`,
    // Step-08
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Stack(
        alignment: const Alignment(0.85, 0.9),
        children: [
          Image(
            image: AssetImage(document.data['imagePath'] as String),
          ),
          document.data['favourited'] as bool
              ? Container(
                  padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                  decoration: const BoxDecoration(
                    color: Colors.white70,
                    borderRadius: BorderRadius.all(Radius.circular(16.0)),
                  ),
                  child: const Icon(
                    Icons.favorite,
                    color: Colors.red,
                  ),
                )
              : null,
        ].where((child) => child != null).toList(),
      );
}
`,
    // Step-09
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            Image(
              image: AssetImage(document.data['imagePath'] as String),
            ),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Loading')),
        body: ListView(
          children: [
            Image(image: AssetImage(imagePath)),
          ],
        ),
      );
}
`,
    // Step-10
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Loading')),
        body: ListView(
          children: [
            HeroImage(imagePath: imagePath),
          ],
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-11
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Loading')),
        body: ListView(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                child: HeroImage(imagePath: imagePath),
              ),
            ),
          ],
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-12
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Loading')),
        body: ListView(
          children: [
            DetailImage(imagePath: imagePath),
          ],
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-13
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-14
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-15
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Text(
        'Photo by \${document.data['photographer']} on Unsplash',
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-16
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
        child: Text(
          'Photo by \${document.data['photographer']} on Unsplash',
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-17
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Photo by \${document.data['photographer']} on Unsplash',
            ),
            document.data['favourited'] as bool
                ? const Icon(Icons.favorite, color: Colors.red)
                : const Icon(Icons.favorite_border, color: Colors.black),
          ],
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-18
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Photo by \${document.data['photographer']} on Unsplash',
              ),
            ),
            const SizedBox(width: 4.0),
            document.data['favourited'] as bool
                ? const Icon(Icons.favorite, color: Colors.red)
                : const Icon(Icons.favorite_border, color: Colors.black),
          ],
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-19
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Photo by \${document.data['photographer']} on Unsplash',
              ),
            ),
            const SizedBox(width: 4.0),
            InkWell(
              child: document.data['favourited'] as bool
                  ? const Icon(Icons.favorite, color: Colors.red)
                  : const Icon(Icons.favorite_border, color: Colors.black),
              onTap: () {},
            ),
          ],
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
    // Step-20
    `
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'DevFest Demo',
        theme: ThemeData(primarySwatch: Colors.pink),
        home: const MyHomePage(title: 'DevFest Demo'),
      );
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({this.title});
  final String title;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: StreamBuilder<QuerySnapshot>(
          stream: Firestore.instance
              .collection('dishes')
              .orderBy('photographer')
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.data == null) {
              return const Center(child: Text('Loading'));
            }
            return Container(
              color: Colors.black,
              child: ListView.builder(
                itemCount: snapshot.data.documents.length,
                itemBuilder: (context, index) => CookingImage(
                      document: snapshot.data.documents[index],
                      key: Key(snapshot.data.documents[index].documentID),
                    ),
              ),
            );
          },
        ),
      );
}

class CookingImage extends StatelessWidget {
  const CookingImage({@required this.document, Key key}) : super(key: key);
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => GestureDetector(
        child: Stack(
          alignment: const Alignment(0.85, 0.9),
          children: [
            HeroImage(imagePath: document.data['imagePath'] as String),
            document.data['favourited'] as bool
                ? Container(
                    padding: const EdgeInsets.fromLTRB(4.0, 5.0, 4.0, 3.0),
                    decoration: const BoxDecoration(
                      color: Colors.white70,
                      borderRadius: BorderRadius.all(Radius.circular(16.0)),
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                    ),
                  )
                : null,
          ].where((child) => child != null).toList(),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailPage(
                    documentID: document.documentID,
                    imagePath: document.data['imagePath'] as String,
                  ),
            ),
          );
        },
      );
}

class DetailPage extends StatelessWidget {
  const DetailPage({
    @required this.documentID,
    @required this.imagePath,
  });
  final String documentID;
  final String imagePath;

  @override
  Widget build(BuildContext context) => StreamBuilder<DocumentSnapshot>(
        stream: Firestore.instance
            .collection('dishes')
            .document(documentID)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Loading')),
              body: ListView(
                children: [DetailImage(imagePath: imagePath)],
              ),
            );
          }
          return Scaffold(
            appBar: AppBar(
              title: Text(snapshot.data.data['shortDescription'] as String),
            ),
            body: ListView(
              children: [
                DetailImage(
                  imagePath: snapshot.data.data['imagePath'] as String,
                ),
                DetailImageLabel(
                  document: snapshot.data,
                ),
              ],
            ),
          );
        },
      );
}

class DetailImageLabel extends StatelessWidget {
  const DetailImageLabel({
    @required this.document,
  });
  final DocumentSnapshot document;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Photo by \${document.data['photographer']} on Unsplash',
              ),
            ),
            const SizedBox(width: 4.0),
            InkWell(
              child: document.data['favourited'] as bool
                  ? const Icon(Icons.favorite, color: Colors.red)
                  : const Icon(Icons.favorite_border, color: Colors.black),
              onTap: () {
                Firestore.instance
                    .collection('dishes')
                    .document(document.documentID)
                    .updateData(<String, dynamic>{
                  'favourited': !(document.data['favourited'] as bool)
                });
              },
            ),
          ],
        ),
      );
}

class DetailImage extends StatelessWidget {
  const DetailImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          child: HeroImage(imagePath: imagePath),
        ),
      );
}

class HeroImage extends StatelessWidget {
  const HeroImage({@required this.imagePath});
  final String imagePath;
  @override
  Widget build(BuildContext context) => Hero(
        child: Image(
          image: AssetImage(imagePath),
        ),
        tag: imagePath,
      );
}
`,
  ];
  private statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  );

  public reset(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const basename = path.posix.basename(editor.document.fileName);
    if (basename !== 'main.dart') {
      return;
    }
    this.step = 0;
    this.setEditorContent(editor, edit);
  }

  public next(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const basename = path.posix.basename(editor.document.fileName);
    if (basename !== 'main.dart') {
      return;
    }

    if (this.step < this.steps.length - 1) {
      this.step += 1;
      this.setEditorContent(editor, edit);
    }
  }

  public previous(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const basename = path.posix.basename(editor.document.fileName);
    if (basename !== 'main.dart') {
      return;
    }

    if (this.step > 0) {
      this.step -= 1;
      this.setEditorContent(editor, edit);
    }
  }

  private setEditorContent(
    editor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
  ) {
    const { document } = editor;
    const fullText = document.getText();
    const range = new vscode.Range(
      document.positionAt(0),
      document.positionAt(fullText.length - 1),
    );
    edit.delete(range);
    edit.insert(document.positionAt(0), this.steps[this.step].trim());
    editor.document.save().then(() => {
      this.statusBarItem.text = `Step #${this.step + 1}`;
      this.statusBarItem.show();
    });
  }
}
