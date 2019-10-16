Vue.component('joke-userinfo', {
    props: {
        joke: Object,
        jokeid: String,
        userid: String
    },
    data: function () {
      return {
          smileEntered: false,
          punchlineEntered: false
      }
    },
    methods: {
        addSmile: function() {
            //if(!this.smileEntered) {
                this.joke.Smiles++;
                var jokeRef = firebase.firestore().collection("usercontent").doc(this.jokeid);
                jokeRef.update({
                    Smiles: firebase.firestore.FieldValue.increment(1)
                });
                this.smileEntered = true;
            //}
        },
        addPunchline: function() {
            var newPunchline = {
                UserId: this.userid,
                Timestamp: (new Date()).toISOString(),
                Smiles: 0,
                Punchline: $("#punchlinetext").val()
            };

            var uniqueId =  Math.random().toString(36).substring(2) + Date.now().toString(36);
            var newDoc = '{ "UserPunchlines.'+ uniqueId + '": ' + JSON.stringify(newPunchline) + '}';
            firebase.firestore().collection('usercontent').doc(this.jokeid).update(
                JSON.parse(newDoc)
            );

            this.joke.UserPunchlines[uniqueId] = newPunchline;  
            this.$forceUpdate(); 
            $("#punchlinetext").val("");
        },
        addPunchlineSmile: function(id) {
            this.joke.UserPunchlines[id].Smiles++;

            var jokeRef = firebase.firestore().collection("usercontent").doc(this.jokeid);
            var updateDoc = {};
            updateDoc["UserPunchlines." + id + ".Smiles"] = firebase.firestore.FieldValue.increment(1);
            jokeRef.update(updateDoc);   
            this.$forceUpdate();          
        }
    },
    template: ` <div>
                    <div v-on:click="addSmile()"> 
                        <i class="material-icons" style="font-size: 48px; cursor: pointer; user-select: none;">insert_emoticon</i>
                        <span style="position: relative; bottom: 19px;">{{joke.Smiles}} Smiles </span>
                    </div>
                    <div v-for="(punchline, id) in joke.UserPunchlines">
                        <div>{{punchline.Punchline}}</div>
                        <div v-on:click="addPunchlineSmile(id)">
                            <i class="material-icons" style="font-size: 34px; cursor: pointer; user-select: none;">insert_emoticon</i>
                            <span style="position: relative; bottom: 13px;">{{punchline.Smiles}} Smiles </span>
                        </div>
                    </div> 
                    <div>
                        <textarea id="punchlinetext"></textarea>
                        <button id="submitpunchline" v-on:click="addPunchline()">Submit</button>
                    </div>
                </div>`
  })